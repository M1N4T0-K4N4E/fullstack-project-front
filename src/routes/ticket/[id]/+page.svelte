<script lang="ts">
  import { page } from "$app/state";

  const ticketId = $derived(page.params.id);
</script>

<main>
  <h1>Ticket Detail</h1>
  <p>Viewing ticket ID: {ticketId}</p>

  <section>
    <h2>Cancel Ticket</h2>
    <p>You can cancel this ticket here.</p>
    <button>Cancel Ticket</button>
  </section>

  <a href="/ticket-report">← Back to Ticket Report</a>
</main>
