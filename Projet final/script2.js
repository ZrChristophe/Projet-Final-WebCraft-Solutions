// script2-ie11-sim.js - IE11 compatible + simulation d'envoi AJAX

// 1️⃣ Année dynamique
var yearSpan = document.getElementById('yearContact');
if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
}

// 2️⃣ Formulaire
var form = document.getElementById('contactForm');
var feedback = document.getElementById('contactFeedback');

if (form && feedback) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Réinitialisation du feedback
        feedback.textContent = '';
        feedback.className = 'form-feedback';

        // Récupération des valeurs
        var name = form.name.value.trim();
        var email = form.email.value.trim();
        var message = form.message.value.trim();
        var errors = [];

        // Validation simple
        if (!name) errors.push('Le nom est requis.');
        if (!email) errors.push("L'email est requis.");
        else {
            var emailPattern = /^[\w.-]+@([\w-]+\.)+[\w-]{2,}$/;
            if (!emailPattern.test(email)) errors.push("Le format de l'email est invalide.");
        }
        if (!message) errors.push('Le message est requis.');

        // Affichage des erreurs
        if (errors.length > 0) {
            feedback.textContent = errors.join(' ');
            feedback.className += ' error';
            return;
        }

        // 3️⃣ Simulation d'envoi
        feedback.textContent = '⏳ Envoi en cours...';

        // Simuler le serveur avec un délai
        setTimeout(function() {
            feedback.textContent = '✅ Votre message a bien été envoyé (simulation).';
            feedback.className += ' success';
            form.reset();

            // Effacer le message après 5 secondes
            setTimeout(function() {
                feedback.textContent = '';
            }, 5000);
        }, 1000);
    });
}
