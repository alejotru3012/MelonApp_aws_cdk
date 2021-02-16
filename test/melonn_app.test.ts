import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as MelonnApp from '../lib/melonn_app-stack';

test('Empty Stack', () => {
    // const app = new cdk.App();
    // // WHEN
    // const stack = new MelonnApp.MelonnAppStack(app, 'MyTestStack');
    // // THEN
    // expectCDK(stack).to(matchTemplate({
    //   "Resources": {}
    // }, MatchStyle.EXACT))
});
