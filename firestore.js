/* This code was an attempt to connect to Firebase's database, Firestore so that I 
   could add and modify the data via the backend, in particular the StepData collection.
   But it isn't completed */

const {
  initializeApp,
  applicationDefault,
  cert
} = require('firebase-admin/app')
const {
  getFirestore,
  Timestamp,
  FieldValue,
  Filter
} = require('firebase-admin/firestore')
const fs = require('firebase-admin')
const credentials = require('../account_secret.json')

const app = initializeApp({ credential: cert(credentials) })

const db = getFirestore()

const collectionRef = db.collection('StepData')
const documentRef = collectionRef.doc('101AB') // Replace with actual document ID

// Use update() to modify specific fields or set() to replace the entire document
return documentRef
  .update({
    Step_count: '299'
  })
  .then(() => {
    console.log('Document successfully updated.')
  })
  .catch(error => {
    console.error('Error updating document:', error)
  })

module.exports = db
