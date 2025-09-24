import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';
import { ValidationPipe } from '@nestjs/common';

describe('Auth E2E Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  const testUser = {
    name: 'E2E Test User',
    email: 'e2e.test@email.com',
    password: 'password123',
  };

  const anotherUser = {
    name: 'Another Test User',
    email: 'another.test@email.com',
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  beforeEach(async () => {
    await cleanupTestData();
  });

  async function cleanupTestData() {
    await prismaService.user.deleteMany({
      where: {
        email: {
          in: [testUser.email, anotherUser.email, 'e2e.reset@email.com'],
        },
      },
    });

    await prismaService.password_reset_tokens.deleteMany({
      where: {
        user: {
          email: {
            in: [testUser.email, anotherUser.email, 'e2e.reset@email.com'],
          },
        },
      },
    });
  }

  describe('POST /api/auth/signup', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.access_token).toBeTruthy();

      const userInDb = await prismaService.user.findUnique({
        where: { email: testUser.email },
      });

      expect(userInDb).toBeDefined();
      expect(userInDb.name).toBe(testUser.name);
      expect(userInDb.email).toBe(testUser.email);
      expect(userInDb.active).toBe(true);
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({})
        .expect(400);

      expect(response.body.message).toContain('Dados incompletos');
    });

    it('should return 400 when password is too short', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          ...testUser,
          password: '123',
        })
        .expect(400);

      expect(response.body.message).toContain('Senha muito curta');
    });

    it('should return 400 when email is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          ...testUser,
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body.message).toContain('Email inválido');
    });

    it('should return 409 when email already exists', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(testUser)
        .expect(409);

      expect(response.body.message).toContain('Email já cadastrado');
    });
  });

  describe('POST /api/auth/signin', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201);
    });

    it('should authenticate user with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.access_token).toBeTruthy();
    });

    it('should return 401 with invalid password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.message).toContain('Credenciais inválidas');
    });

    it('should return 401 with non-existent email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({
          email: 'nonexistent@email.com',
          password: testUser.password,
        })
        .expect(401);

      expect(response.body.message).toContain('Credenciais inválidas');
    });

    it('should return 400 when credentials are missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({})
        .expect(400);

      expect(response.body.message).toContain('Dados incompletos');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201);
    });

    it('should process forgot password for existing user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(201);

      expect(response.body.message).toContain('Se o email existir');

      const tokens = await prismaService.password_reset_tokens.findMany({
        where: {
          user: { email: testUser.email },
        },
      });

      expect(tokens.length).toBe(1);
      expect(tokens[0].token).toBeTruthy();
    });

    it('should return success even for non-existent email (security)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@email.com' })
        .expect(201);

      expect(response.body.message).toContain('Se o email existir');
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({})
        .expect(400);

      expect(response.body.message).toContain('Email obrigatório');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let resetToken: string;

    beforeEach(async () => {
      const user = await prismaService.user.create({
        data: {
          name: 'Reset Test User',
          email: 'e2e.reset@email.com',
          password: 'hashedpassword', // Simular hash
        },
      });

      resetToken = 'test-reset-token-' + Date.now();

      await prismaService.password_reset_tokens.create({
        data: {
          token: resetToken,
          user_id: user.id_user,
          expires_at: new Date(Date.now() + 3600000), // 1 hora
        },
      });
    });

    it('should reset password with valid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: 'newpassword123',
        })
        .expect(201);

      expect(response.body.message).toContain('Senha redefinida com sucesso');

      const user = await prismaService.user.findUnique({
        where: { email: 'e2e.reset@email.com' },
      });

      expect(user.password).not.toBe('hashedpassword');

      const token = await prismaService.password_reset_tokens.findUnique({
        where: { token: resetToken },
      });

      expect(token).toBeNull();
    });

    it('should return 404 with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          password: 'newpassword123',
        })
        .expect(404);

      expect(response.body.message).toContain('Token inválido');
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({})
        .expect(400);

      expect(response.body.message).toContain('Dados incompletos');
    });
  });

  describe('GET /api/auth/profile (Protected Route)', () => {
    let authToken: string;

    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201);

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      authToken = loginResponse.body.access_token;
    });

    it('should return user profile with valid JWT', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('sub');
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).toHaveProperty('name', testUser.name);
    });

    it('should return 401 without authorization header', async () => {
      await request(app.getHttpServer()).get('/api/auth/profile').expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Complete Auth Flow', () => {
    it('should complete full authentication flow', async () => {
      const signupResponse = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send(anotherUser)
        .expect(201);

      const signupToken = signupResponse.body.access_token;

      const profileResponse1 = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${signupToken}`)
        .expect(200);

      expect(profileResponse1.body.email).toBe(anotherUser.email);

      // Fazer logout (não tem endpoint, mas token ainda deve funcionar)
      // Fazer login novamente
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({
          email: anotherUser.email,
          password: anotherUser.password,
        })
        .expect(201);

      const loginToken = loginResponse.body.access_token;

      const profileResponse2 = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${loginToken}`)
        .expect(200);

      expect(profileResponse2.body.email).toBe(anotherUser.email);
    });
  });
});
