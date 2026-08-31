const checkout = async () => {
  const res = await fetch('/api/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const { url } = await res.json();
  if (url) {
    window.location.href = url;
  } else {
    alert('Payment failed. Please try again.');
  }
};