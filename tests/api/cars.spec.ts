import { test, expect, APIRequestContext, request } from '@playwright/test';
import { env } from '../../config/env';

const apiBaseUrl = `${env.baseUrl}api/`;

const validCarPayload = {
  carBrandId: 1,
  carModelId: 1,
  mileage: 100,
};

test.describe('POST /api/cars', () => {
  let authedContext: APIRequestContext;
  let anonymousContext: APIRequestContext;

  test.beforeAll(async () => {
    authedContext = await request.newContext({
      baseURL: apiBaseUrl,
      httpCredentials: env.httpCredentials,
    });
    const signinResponse = await authedContext.post('auth/signin', {
      data: { email: env.testUser.email, password: env.testUser.password },
    });
    expect(signinResponse.ok()).toBeTruthy();

    anonymousContext = await request.newContext({
      baseURL: apiBaseUrl,
      httpCredentials: env.httpCredentials,
    });
  });

  test.afterAll(async () => {
    await authedContext.dispose();
    await anonymousContext.dispose();
  });

  test('creates a car when the payload is valid', async () => {
    const response = await authedContext.post('cars', { data: validCarPayload });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.data).toMatchObject({
      carBrandId: validCarPayload.carBrandId,
      carModelId: validCarPayload.carModelId,
      mileage: validCarPayload.mileage,
      brand: 'Audi',
      model: 'TT',
    });

    await authedContext.delete(`cars/${body.data.id}`);
  });

  test('rejects a car that is missing a required field', async () => {
    const { carModelId, ...payloadWithoutCarModelId } = validCarPayload;

    const response = await authedContext.post('cars', { data: payloadWithoutCarModelId });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.status).toBe('error');
  });

  test('rejects creating a car when not authenticated', async () => {
    const response = await anonymousContext.post('cars', { data: validCarPayload });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.status).toBe('error');
  });
});
