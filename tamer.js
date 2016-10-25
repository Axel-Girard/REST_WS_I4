'use strict';
var comptePromesse = 0;

function testPromise() {
  var thisComptePromesse = ++comptePromesse;

  var log = document.getElementById('log');
  log.insertAdjacentHTML('beforeend', thisComptePromesse +
      ') Started (<small>Début du code synchrone</small>)<br/>');

  // on crée une nouvelle promesse :
  var p1 = new Promise(
    // La fonction de résolution est appelée avec la capacité de
    // tenir ou de rompre la promesse
    function(resolve, reject) {
      log.insertAdjacentHTML('beforeend', thisComptePromesse + ' Promise started (<small>Début du code asynchrone</small>)<br/>');

      // Voici un exemple simple pour créer un code asynchrone
      window.setTimeout(
        function() {
          // On tient la promesse !
          resolve(thisComptePromesse);
        }, Math.random() * 2000 + 1000);
    });

  // On définit ce qui se passe quand la promesse est tenue
  // et ce qu'on appelle (uniquement) dans ce cas
  // La méthode catch() définit le traitement à effectuer
  // quand la promesse est rompue.
  p1.then(
    // On affiche un message avec la valeur
    function(val) {
      log.insertAdjacentHTML('beforeend', val +
          ' Promise fulfilled (<small>Fin du code asynchrone</small>)<br/>');
    }).catch(
      // Promesse rejetée
      function() {
        console.log("promesse rompue");
      });

  log.insertAdjacentHTML('beforeend', thisComptePromesse +
      ' Promise made (<small>Fin du code synchrone</small>)<br/>');
}
