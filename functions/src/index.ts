import * as functions from 'firebase-functions';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
/*const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.createUser = functions.firestore
    .document('users/{userId}/operations/{operationId}')
    .onCreate((snap, context) => {
        const data = snap.data();
        if (data !== undefined) {
            const monto = data.monto;
            db.doc('users/' + context.params.userId).update({
                saldo: FieldValue.increment(monto)
            });

            db.doc('users/' + data.origen).update({
                saldo: FieldValue.increment(-Math.abs(monto))
            });
        }
    });
*/

const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.database();

exports.registerTransaction = functions.database.ref('/transactions/{transactionId}')
    .onCreate((snapshot, context) => {
        // Grab the current value of what was written to the Realtime Database.
        const data = snapshot.val();
        const monto = data.monto;
        
        var saldoReceptorRef = db.ref('/accounts/' + data.receptor).child('saldo');
        saldoReceptorRef.transaction(function (current: any) {
                return (current || 0) + monto;
        });

        var saldoOrigenRef = db.ref('/accounts/' + data.origen).child('saldo');
        saldoOrigenRef.transaction(function (current: any) {
                return (current || 0) - monto;
        });
    });

    exports.registerPayment = functions.database.ref('/payments/{paymentId}')
    .onCreate((snapshot, context) => {
        // Grab the current value of what was written to the Realtime Database.
        const data = snapshot.val();
        const monto = data.monto;
        
        var saldoReceptorRef = db.ref('/accounts/' + data.origen).child('saldo');
        saldoReceptorRef.transaction(function (current: any) {
                return (current || 0) - monto;
        });
    });
