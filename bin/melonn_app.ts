#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MelonnAppStack } from '../lib/melonn_app-stack';

const app = new cdk.App();
new MelonnAppStack(app, 'MelonnAppStack');
