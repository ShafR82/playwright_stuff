import { test, expect } from '@playwright/test';
import { assert } from 'console';
import * as dotenv from 'dotenv';

const dotenv_load = dotenv.config();

if (dotenv_load.error){
  throw dotenv_load.error;
}

const TestRepoName = 'TestRepoIssues' 

test.describe('Login & Repositories', () => {

  test.beforeAll("Login", async ({request}) => {
    console.log("");
    const response = await request.get(`/user`);
    response.ok() ? console.log(`Login successul ${response.status()}`) : console.log(`Login error ${response.status()}`);
  });

  test('Check repositories', async ({request, browser}) => {
    const browserContext = await browser.newContext();
    const page = await browserContext.newPage();
    await page.goto("https://github.com/login");
    await page.getByLabel('Username or email address').fill(`${process.env.USER_GH}`);
    await page.getByLabel('Password').fill(`${process.env.PASS_GH}`);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.waitForLoadState();
    await page.goto(`https://github.com/${process.env.USER_GH}`);
    const text = await page.getByRole('link', { name: 'Repositories' }).innerText();
    const nbRepoByUI = parseInt(text.split(' ')[2]);

    const response = await request.get('/user/repos');
    const nbRepoByAPI = (await response.json()).length;
    expect(nbRepoByUI).toBe(nbRepoByAPI);
  });

});

test.describe('Github Issues tests', () => {
   
  test.beforeAll("Before All: Let's create a test repo", async ({request}) => {
  
    console.log("Before All: Let's create a test repo"); 
  
    const testRepo = await request.post('/user/repos', {
      data: {
        name: TestRepoName
      }  
    }); 

    console.log(testRepo.status());
    expect(testRepo.ok()).toBeTruthy();  
  });


  test.afterAll("After All: Let's delete the temporary repo", async ({request}) => {

    console.log("After All: Let's delete the temporary repo");
    const testRepo = await request.delete(`/repos/${process.env.USER_GH}/${TestRepoName}`); 
    console.log(testRepo.status());
    expect(testRepo.ok()).toBeTruthy();
  });


  test('Bug issue creation', async ( { request, page} ) => { 
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
        await page.waitForLoadState();
        expect(await page.getByRole('link', { name: '[Bug] report 1', exact: true })).toHaveText('[Bug] report 1');
        console.log("Test Issue found on the repo's issues page. OK!")
      }
      else{
        throw("Can't reach your github profile page!");
      }
    }
  });
});