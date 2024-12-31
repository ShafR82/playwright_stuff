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

test('should create a bug report', async ( { request, page} ) => {
  
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

  const response = await page.goto(`https://github.com/${process.env.USER_GH}`);
  if (response){
    if(response.ok()){
      console.log(`I'm on your github profile page! ${response.status()}`);
      await page.getByRole('link', {name : 'Repositories'}).first().click();
      await page.getByRole('link', {name : TestRepoName}).click();
      await page.getByRole('link', {name : 'Issues 1', exact: true}).click();
      await page.getByPlaceholder('Search all issues').fill('is:issue is:open "[Bug] report 1" in:title');
      await page.getByPlaceholder('Search all issues').press('Enter');
      expect(await page.getByRole('link', { name: '[Bug] report 1', exact: true })).toHaveText('[Bug] report 1', {timeout: 10000});
    }
    else{
      throw("Can't reach your github profile page!");
    }
  }
  
});
