// --- Mise à jour de l'année dans le footer ---
var yearAbout = document.getElementById('yearAbout');
if (yearAbout) {
  yearAbout.textContent = new Date().getFullYear();
}

// --- Validation formulaire (simulation) ---
var form = document.getElementById('contactForm');
var feedback = document.getElementById('contactFeedback');

if (form && feedback) {
  // rendre le feedback accessible
  feedback.setAttribute('role', 'alert');
  feedback.setAttribute('aria-live', 'polite');

  form.addEventListener('submit', function(e){
    e.preventDefault();

    feedback.textContent = "";
    feedback.className = "form-feedback";

    var name = form.name.value.trim();
    var email = form.email.value.trim();
    var message = form.message.value.trim();

    var errors = [];

    if(!name) errors.push("Le nom est requis.");
    if(!email) errors.push("L'email est requis.");
    else if(!/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(email))
      errors.push("Le format de l'email est invalide.");
    if(!message) errors.push("Le message est requis.");

    if(errors.length > 0){
      feedback.textContent = errors.join(" ");
      feedback.classList.add("error");
    } else {
      feedback.textContent = "✅ Votre message a bien été envoyé (simulation).";
      feedback.classList.add("success");
      form.reset();
    }
  });
}
