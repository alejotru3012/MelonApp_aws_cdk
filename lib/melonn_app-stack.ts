import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import * as amplify from '@aws-cdk/aws-amplify';
import * as codebuild from '@aws-cdk/aws-codebuild';
require('dotenv').config()

interface CustomStackProps{
  lambda: Array<IFunctionProps>;
  // http: Array<IHttpIntegration>;
}
interface IHttpIntegration {
  method: string,
  path: string,
  apiKey: boolean
}
interface IFunctionProps {
  name: string;
  method: string;
  path: string;
  apiKey: boolean;
}

export class MelonnAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: CustomStackProps) {
    super(scope, id);

    // The code that defines your stack goes here

    // create vpc
    const vpc = ec2.Vpc.fromVpcAttributes(this, 'myvpc', {
      vpcId: process.env.VPC_ID || '',
      availabilityZones: [
        'us-east-1'
      ],

    })

    // create Api Gateway
    const api = new apigateway.RestApi(this, `api`, {
      restApiName: `api_melonn`,
      deployOptions: {
        stageName: 'dev'
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS
      }
    });

    // create apikey and usage plan for apigateway
    const apiKey = new apigateway.ApiKey(this, 'apikey', {
      apiKeyName: `apikey_melonn`,
      value: process.env.API_KEY_VALUE || ''
    });

    const usagePlan = new apigateway.UsagePlan(this, 'usagePlan', {
      apiKey: apiKey,
      name: `up_melonn`,
      apiStages: [
        {
          api: api,
          stage: api.deploymentStage
        }
      ]
    });

    // create layer for lambdas
    const layer = new lambda.LayerVersion(this, 'utilsLayer', {
      code: lambda.Code.fromAsset(`./resources/layers`),
      compatibleRuntimes: [lambda.Runtime.NODEJS_12_X],
    });

    // create lambda functions, api resources and lambda integrations
    props.lambda.forEach(element => {
      const fn = new lambda.Function(this, `Lambda-${element.name}`, {
        code: lambda.Code.fromAsset(`./resources/lambdas/${element.name}`),
        handler: `${element.name}.handler`,
        runtime: lambda.Runtime.NODEJS_12_X,
        functionName: `fn_${element.name}`,
        layers: [layer],
        environment: {
          URL_EXPRESSJS : process.env.EXPRESSJS_URL || '',
          URL_SHIPPING_DETAILS : process.env.MELONN_SHIPPING_DETAILS_URL || '',
          SHIPPING_KEY : process.env.MELON_API_KEY || ''
        },

      });

      const resource = api.root.resourceForPath(`${element.path}`);

      const fnIntegration = new apigateway.LambdaIntegration(fn);
      resource.addMethod(`${element.method}`, fnIntegration, {
        apiKeyRequired: element.apiKey
      });

    });


    // const amplifyApp = new amplify.App(this, `amplify_melonn`, {
    //   sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
    //     owner: process.env.AMPLIFY_REPO_OWNER || '',
    //     repository: process.env.AMPLIFY_REPOSITORY || '',
    //     oauthToken: cdk.SecretValue.plainText(process.env.AMPLIFY_GIT_TOKEN || '')
    //   }),
    //   buildSpec: codebuild.BuildSpec.fromObject({ // Alternatively add a `amplify.yml` to the repo
    //     version: '1',
    //     frontend: {
    //       phases: {
    //         preBuild: {
    //           commands: [
    //             'npm ci'
    //           ]
    //         },
    //         build: {
    //           commands: [
    //             'npm run build'
    //           ]
    //         }
    //       },
    //       artifacts: {
    //         baseDirectory: 'build',
    //         files: '**/*'
    //       },
    //       cache: {
    //         paths: [
    //           'node_modules/**/*'
    //         ]
    //       }
    //     }
    //   }),
    //   appName: `cdk_melonn`,
    //   environmentVariables: {
    //     REACT_APP_API_URL: api.urlForPath(),
    //     REACT_APP_API_KEY: process.env.API_KEY_VALUE || '',

    //     REACT_APP_MELONN_URL: process.env.MELONN_URL || '',
    //     REACT_APP_MELONN_KEY: process.env.MELONN_KEY || ''
    //   },

    // });

    // amplifyApp.addBranch('master', {
    //   autoBuild: true,
    //   pullRequestPreview: false,
    // });

  }
}
