import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';

const result = dotenv.config();

if (result.error){
  throw result.error;
}
else{
  console.log(`env content: ${result.parsed}`);
}

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

  console.log(`Issue creation ${newIssue.status()}`);
  expect(newIssue.ok()).toBeTruthy();

  const issuesFiltered = await request.get(`/repos/${process.env.USER_GH}/${TestRepoName}/issues`);
  console.log(`Issue listing ${issuesFiltered.status()}`);

  expect(await issuesFiltered.json()).toContainEqual(
    expect.objectContaining({
      title: '[Bug] report 1',
      body: 'False Bug - just testing the API via Playwright',
    })
  );
  
  
});
