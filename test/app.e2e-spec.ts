import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { DataSource, Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JobPost } from '../src/job-posts/entities/job-post.entity';
import { LoginResponse } from '../src/auth/auth.service';
import { HourlyWage, WorkTime } from '../src/job-posts/dto/job-post-query.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let userRepository: Repository<User>;
  let jobPostRepository: Repository<JobPost>;
  let dataSource: DataSource;

  let user: User; // 테스트에 사용될 유저
  let userToken: string;

  const resetDb = async () => {
    const jobPostTable = jobPostRepository.metadata.tableName;
    const userTable = userRepository.metadata.tableName;

    await dataSource.query(
      `TRUNCATE "${jobPostTable}" RESTART IDENTITY CASCADE`,
    );
    await dataSource.query(`TRUNCATE "${userTable}" RESTART IDENTITY CASCADE`);
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get(getRepositoryToken(User));
    jobPostRepository = moduleFixture.get(getRepositoryToken(JobPost));
    dataSource = moduleFixture.get(DataSource);
  });

  beforeEach(async () => {
    await resetDb();

    const hashed = await bcrypt.hash('testpassword', 10);
    user = await userRepository.save({
      username: 'testuser',
      password: hashed,
      nickname: 'tester',
      phone: '010-1111-1111',
      email: 'test@test.com',
      imageUrl: null,
    });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testuser', password: 'testpassword' })
      .expect(200);
    userToken = (loginRes.body as LoginResponse).access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('/job-posts', () => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    let testJobPosts: JobPost[];

    beforeEach(async () => {
      testJobPosts = await jobPostRepository.save([
        {
          title: '1',
          location: '인천 연수구 송도동',
          hourlyWage: 12800,
          startTime: '16:00',
          endTime: '22:00',
          totalHours: 6,
          pay: 76800,
          createdAt: new Date('2025-08-23T16:22:00'),
          date: yesterday,
          place: 'GS25 송도국제점',
          imageUrl: null,
          content: '카운터랑 진열 위주예요. 처음이셔도 천천히 알려드려요!',
          userId: user.id,
        },
        {
          title: '2',
          location: '서울 마포구 합정동',
          hourlyWage: 8000,
          startTime: '10:00',
          endTime: '18:00',
          totalHours: 8,
          pay: 64000,
          createdAt: new Date('2025-08-22T16:22:00'),

          date: today,
          place: '라떼포레스트 합정',
          imageUrl: null,
          content: '샷 추출/컵 세팅 같이해요. 밝게 인사만 잘해도 충분!',
          userId: user.id,
        },
        {
          title: '3',
          location: '서울 강남구 대치동',
          hourlyWage: 9000,
          startTime: '12:00',
          endTime: '22:00',
          totalHours: 10,
          pay: 90000,
          createdAt: new Date('2025-08-21T16:22:00'),
          date: tomorrow,
          place: '코엑스 D홀',
          imageUrl: null,
          content: '부스 위치 안내하고 줄 정리해요. 활동적인 분이면 딱!',
          userId: user.id,
        },
        {
          title: '4',
          location: '서울 종로구 관철동',
          hourlyWage: 8600,
          startTime: '13:00',
          endTime: '19:00',
          totalHours: 6,
          pay: 51600,
          createdAt: new Date('2025-08-20T16:22:00'),
          date: tomorrow,
          place: '문학당 서점 종각',
          imageUrl: null,
          content: '신간 정리하고 포장 도와주세요. 조용한 분위기예요 🙂',
          userId: user.id,
        },
      ]);
    });

    it('작성 날짜를 기준으로 페이징 처리된 데이터를 nextCursor와 함께 가져온다. (GET 200)', async () => {
      const res1 = await request(app.getHttpServer())
        .get('/job-posts?limit=2')
        .expect(200);

      const body1 = res1.body as { data: JobPost[]; nextCursor: string | null };
      const page1 = {
        data: body1.data.map((d) => d.title),
        nextCursor: body1.nextCursor,
      };

      expect(page1).toStrictEqual({
        data: ['2', '3'],
        nextCursor: testJobPosts[2].createdAt.toISOString(),
      });

      const res2 = await request(app.getHttpServer())
        .get(`/job-posts?limit=2&cursor=${page1.nextCursor}`)
        .expect(200);

      const body2 = res2.body as { data: JobPost[]; nextCursor: string | null };
      const page2 = {
        data: body2.data.map((d) => d.title),
        nextCursor: body2.nextCursor,
      };

      expect(page2).toStrictEqual({
        data: ['4'],
        nextCursor: null,
      });
    });

    it('키워드를 바탕으로 검색된 데이터를 가져온다. (GET 200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/job-posts')
        .query({ searchKeyword: '서점' })
        .expect(200);

      const places = (
        res.body as { data: JobPost[]; nextCursor: string | null }
      ).data.map((p) => p.place);

      expect(places).toEqual(
        expect.arrayContaining([expect.stringContaining('서점')]),
      );
    });

    it('선택된 근무시간과 시급에 해당하는 데이터를 가져온다. (GET 200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/job-posts')
        .query({ workTime: WorkTime.LONG, hourlyWage: HourlyWage.LOW })
        .expect(200);
      const results = (
        res.body as { data: JobPost[]; nextCursor: string | null }
      ).data.map((p) => p.title);

      expect(results).toEqual(['3']);
    });

    it('과거 게시글을 포함한 데이터를 가져온다. (GET 200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/job-posts')
        .query({ showPast: true })
        .expect(200);

      const results = (
        res.body as { data: JobPost[]; nextCursor: string | null }
      ).data.map((p) => p.title);

      expect(results).toEqual(['1', '2', '3', '4']);
    });

    it('게시글을 작성할 수 있다. (POST 201)', () => {
      const createJobPostDto = {
        title: '게시글 작성 테스트',
        location: '경남 김해시 대청동',
        pay: 100000,
        date: new Date(),
        startTime: '10:00',
        endTime: '20:00',
        totalHours: 10,
        place: '우리집',
        imageUrl: null,
        content: '방청소 부탁드려요.',
        hourlyWage: 10000,
        userId: user.id,
      };
      return request(app.getHttpServer())
        .post('/job-posts')
        .send(createJobPostDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toMatchObject({
            identifiers: [{ id: testJobPosts.length + 1 }],
          });
        });
    });
  });

  describe('/job-posts/:id', () => {
    let jobPost: JobPost;
    let otherToken: string;

    beforeEach(async () => {
      jobPost = await jobPostRepository.save({
        title: '게시글 작성 테스트',
        location: '경남 김해시 대청동',
        pay: 100000,
        date: new Date(),
        startTime: '10:00',
        endTime: '20:00',
        totalHours: 10,
        place: '우리집',
        imageUrl: null,
        content: '방청소 부탁드려요.',
        hourlyWage: 10000,
        userId: user.id,
      });

      const hashed = await bcrypt.hash('otherpassword', 10);
      await userRepository.save({
        username: 'otheruser',
        password: hashed,
        nickname: 'tester2',
        phone: '010-1111-1111',
        email: 'test@test.com',
        imageUrl: null,
      });

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'otheruser', password: 'otherpassword' })
        .expect(200);
      otherToken = (loginRes.body as LoginResponse).access_token;
    });

    it('자신이 작성한 게시글을 수정할 수 있다. (PATCH 201)', () => {
      const updateJobPostDto = {
        title: '게시글 업데이트 테스트',
      };

      return request(app.getHttpServer())
        .patch(`/job-posts/${jobPost.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateJobPostDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            affected: 1,
          });
        });
    });
    it('다른 사람이 작성한 게시글을 수정할 수 없다. (PATCH 403)', () => {
      const updateJobPostDto = {
        title: '게시글 업데이트 테스트',
      };

      return request(app.getHttpServer())
        .patch(`/job-posts/${jobPost.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(updateJobPostDto)
        .expect(403);
    });
    it('로그인 하지 않고 게시글을 수정할 수 없다. (PATCH 401)', () => {
      const updateJobPostDto = {
        title: '게시글 업데이트 테스트',
      };

      return request(app.getHttpServer())
        .patch(`/job-posts/${jobPost.id}`)
        .send(updateJobPostDto)
        .expect(401);
    });

    it('자신이 작성한 게시글을 삭제할 수 있다. (DELETE 201)', () => {
      return request(app.getHttpServer())
        .delete(`/job-posts/${jobPost.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });
    it('다른 사람이 작성한 게시글을 삭제할 수 없다. (DELETE 403)', () => {
      return request(app.getHttpServer())
        .delete(`/job-posts/${jobPost.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
    });
    it('로그인 하지 않고 게시글을 삭제할 수 없다. (DELETE 401)', () => {
      return request(app.getHttpServer())
        .delete(`/job-posts/${jobPost.id}`)
        .expect(401);
    });
  });
});
