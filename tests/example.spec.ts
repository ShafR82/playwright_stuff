import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

console.log(`user = ${process.env.USER_GH}`); //loading the github repo access info as env variable
const TestRepoName = 'TestRepo' 

test.beforeAll(async ({request}) => {
 console.log("Before All: Let's create a test repo"); 

 const testRepo = await request.post('/user/repos', {
    data: {
      name: TestRepoName
    }
 }); 

 console.log(testRepo.status());
 expect(testRepo.ok()).toBeTruthy();
});

test.afterAll(async ({request}) => {
  console.log("After All: Let's delete the temporary repo")
 
  const testRepo = await request.delete(`/repos/${process.env.USER_GH}/${TestRepoName}`); 
  console.log(testRepo.status());
  expect(testRepo.ok()).toBeTruthy();

});

test('should create a bug report', async ( { request} ) => {
  
  const newIssue = await request.post(`/repos/${process.env.USER_GH}/${TestRepoName}/issues`, {
    data: {
        title: '[Bug] report 1',
        body: 'False Bug - just testing the API via Playwright',
    }
  });

  console.log(newIssue.status());
  expect(newIssue.ok()).toBeTruthy();
  
});