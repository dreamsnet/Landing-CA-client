const whatsAppLinks = document.querySelectorAll(".wp-link");

whatsAppLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    window.dataLayer.push({
      event: "whatsapp_tiklama",
    });
  });
});
