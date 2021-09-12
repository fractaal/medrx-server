import * as admin from "firebase-admin"
import Logger from "../logger"

const log = Logger('Firebase')

enum RequiredConfigKey {
  type, 
  project_id, 
  private_key_id, 
  private_key, 
  client_email, 
  client_id, 
  auth_uri, 
  token_uri, 
  auth_provider_x509_cert_url, 
  client_x509_cert_url
}

type RequiredConfigKeys = keyof typeof RequiredConfigKey

const config = {} as Record<RequiredConfigKeys, string>;

/**
 * Typescript enums are converted to objects that are mapped in both ways
 * e.g.
 * enum MyEnum { Foo, Bar }
 * becomes a Javascript object that looks like { 0: 'Foo', 1: 'Bar', Foo: 0, Bar: 1 }
 * at runtime. This means we can both index the key and the value of the enum easily.
 * I am filtering the enum below to select only the non-number keys to get the "Foo" and "Bar"
 * part of the object that the enum generates at runtime.
 * 
 * See more here: https://stackoverflow.com/questions/48768774/how-to-get-all-the-values-of-an-enum-with-typescript
 */
Object.keys(RequiredConfigKey)
  .filter(x => isNaN(Number(x)))
  .forEach(x => {
    const value = process.env[`FIREBASE_${x.toUpperCase()}`]
    if (value === undefined) {
      log.error(`Environment variable FIREBASE_${x.toUpperCase()} is not set. MedRx server cannot start without it!`)
      process.exit(1)
    }
    config[x as RequiredConfigKeys] = value
  }
)

admin.initializeApp({
  credential: admin.credential.cert(config as unknown as admin.ServiceAccount),
  databaseURL: "https://medrx-test-default-rtdb.asia-southeast1.firebasedatabase.app"
});