
## How I set up my Google Function

abridged notes from https://blog.leandrotoledo.org/deploying-google-cloud-functions-using-github-actions-and-workload-identity-authentication/

* Install Python3.10 and gcloud CLI
* New Project on Google Cloud Platform
  * mine is `gallery-challen-info`
  * https://us-central1-www-challen-info.cloudfunctions.net/openAiProxy
* use gitbash to run the commands
* set some vars 
```bash
export GITHUB_REPO=areve/gallery
export PROJECT_ID=gallery-challen-info
export SERVICE_ACCOUNT=github-actions-service-account
export WORKLOAD_IDENTITY_POOL=gh-pool
export WORKLOAD_IDENTITY_PROVIDER=gh-provider
```
* set the project:
```bash
gcloud config set project $PROJECT_ID
```

3. Enable the APIs for Cloud Functions, Cloud Build and IAM Credential:
```bash
gcloud services enable cloudfunctions.googleapis.com cloudbuild.googleapis.com iamcredentials.googleapis.com
```

4. Create a Service Account that will be used by GitHub Actions:
```bash
gcloud iam service-accounts create $SERVICE_ACCOUNT --display-name="GitHub Actions Service Account"
```

5. Bind the Service Account to the Roles in the Services it must interact:
```bash
gcloud projects add-iam-policy-binding $PROJECT_ID \
   --member="serviceAccount:$SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com" \
   --role="roles/cloudfunctions.developer"
gcloud projects add-iam-policy-binding $PROJECT_ID \
   --member="serviceAccount:$SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com" \
   --role="roles/iam.serviceAccountUser"
```

6. Create a Workload Identity Pool for GitHub:
```bash
gcloud iam workload-identity-pools create $WORKLOAD_IDENTITY_POOL \
   --location="global" \
   --display-name="GitHub pool"
```

7. Create a Workload Identity Provider for GitHub:
```bash
gcloud iam workload-identity-pools providers create-oidc $WORKLOAD_IDENTITY_PROVIDER \
   --location="global" \
   --workload-identity-pool=$WORKLOAD_IDENTITY_POOL \
   --display-name="GitHub provider" \
   --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
   --issuer-uri="https://token.actions.githubusercontent.com"
```

8. Retrieve the Workload Identity Pool ID:
```bash
WORKLOAD_IDENTITY_POOL_ID=$(gcloud iam workload-identity-pools \
   describe $WORKLOAD_IDENTITY_POOL \
   --location="global" \
   --format="value(name)")
```

9. Allow authentications from the Workload Identity Provider originating from your repository:
```bash
gcloud iam service-accounts add-iam-policy-binding \
   $SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com \
   --role="roles/iam.workloadIdentityUser" \
   --member="principalSet://iam.googleapis.com/${WORKLOAD_IDENTITY_POOL_ID}/attribute.repository/${GITHUB_REPO}"
```

10. Finally, extract the Workload Identity Provider resource name:
```bash
WORKLOAD_IDENTITY_PROVIDER_LOCATION=$(gcloud iam workload-identity-pools providers \
   describe $WORKLOAD_IDENTITY_PROVIDER \
   --location="global" \
   --workload-identity-pool=$WORKLOAD_IDENTITY_POOL \
   --format="value(name)")
```

## Create a GitHub Actions Workflow
We will create a simple workflow that can be triggered by new changes on the main branch, pull requests or manual dispatch. This workflow will create a new Google Cloud Function called helloWorld (if one doesn't exist already) and will run a simple curl test on the function URL.

When omitting some attributes under google-github-actions/deploy-cloud-functions@v0, it assumes the Cloud Function name is the same as the entry point, in our index.js file note export.helloWorld. Also, it defaults the region to us-central1, and event_trigger_type to HTTP. Read more about how to change these inputs here.

1. Head over to your GitHub Project, go to Actions, then click on set up a workflow yourself:

Landing page for new GitHub Actions
2. Before we edit the main.yml file, let's recover some variables from our terminal session:

```bash
echo $WORKLOAD_IDENTITY_PROVIDER_LOCATION
```

```bash
echo $SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com
```

use those values in the yaml pipeline

3. Now, using the values from above, replace them in the file below and submit the changes on GitHub by clicking on the Start commit button.

pipeline yaml created at .github/workflows/func.yml

4. Almost immediately after submitting you can see a new workflow run under the Actions tab. If everything goes well your function will be deployed:


Make the API public

```bash
gcloud functions add-iam-policy-binding helloWorld \
  --member="allUsers" \
  --role="roles/cloudfunctions.invoker"
```

Done, next to make it do something better