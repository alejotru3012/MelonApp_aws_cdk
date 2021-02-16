#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MelonnAppStack } from '../lib/melonn_app-stack';

const app = new cdk.App();
new MelonnAppStack(app, 'MelonnAppStack', {
    lambda: [
        {
            name: 'get_orders',
            method: 'GET',
            path: 'orders',
            apiKey: true
        },
        {
            name: 'get_order_id',
            method: 'GET',
            path: 'orders/{id}',
            apiKey: true
        },
        {
            name: 'create_order',
            method: 'POST',
            path: 'orders/create',
            apiKey: true
        },

    ]

});
