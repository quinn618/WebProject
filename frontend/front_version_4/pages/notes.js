document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('searchInput');
  const cards = document.querySelectorAll('.note-card');
  const emptyState = document.getElementById('emptyState');

  input.addEventListener('input', () => {
    const query = input.value.toLowerCase().trim();
    let visible = 0;

    cards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const desc = card.querySelector('p').textContent.toLowerCase();
      const match = title.includes(query) || desc.includes(query);
      card.style.display = match ? 'flex' : 'none';
      if (match) visible++;
    });

    emptyState.style.display = visible === 0 ? 'block' : 'none';
  });
});