<script lang="ts">
  import { page } from "$app/state";

  const eventId = $derived(page.params.id);
</script>

<main>
  <h1>Event Detail</h1>
  <p>Viewing event ID: {eventId}</p>

  <section>
    <h2>Buy Ticket</h2>
    <p>Purchase a ticket for this event.</p>
    <button>Buy Ticket</button>
  </section>

  <a href="/event-list">← Back to Event List</a>
</main>
