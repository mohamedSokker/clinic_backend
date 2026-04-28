import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

import { setDefaultResultOrder } from 'dns';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firebaseApp: admin.app.App;

  constructor(private configService: ConfigService) {
    // Force IPv4 first to avoid ETIMEDOUT issues with Google/Firebase APIs
    if (typeof setDefaultResultOrder === 'function') {
      setDefaultResultOrder('ipv4first');
    }
  }

  onModuleInit() {
    const serviceAccount = {
      projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
      clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
      privateKey: this.configService
        .get<string>('FIREBASE_PRIVATE_KEY')
        ?.replace(/\\n/g, '\n'),
    };

    if (
      serviceAccount.projectId &&
      serviceAccount.clientEmail &&
      serviceAccount.privateKey
    ) {
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      console.warn(
        'Firebase Service Account not fully configured. Auth verification will fail.',
      );
    }
  }

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    return admin.auth().verifyIdToken(idToken);
  }

  get auth() {
    return admin.auth();
  }
}
