import AdminJSExpress from '@adminjs/express';
import { FirestoreAdapter } from '../../../src';
import AdminJS from 'adminjs';
import { Express } from 'express';
import firebase from 'firebase';

import { createUserResource } from './resources/user/user.resource';

const setupAdmin = async (app: Express): Promise<void> => {
  AdminJS.registerAdapter(FirestoreAdapter as any);
  const adminJs = new AdminJS({
    branding: {
      companyName: 'Firebase example',
    },
    resources: [
      createUserResource(),
      {
        collection: firebase.firestore().collection('Locations'),
        schema: {
          name: 'string',
          latitude: 'number',
          longitude: 'number',
        },
      },
    ],
  });

  const router = await AdminJSExpress.buildRouter(adminJs);
  app.use(adminJs.options.rootPath, router);
};

export default setupAdmin;
