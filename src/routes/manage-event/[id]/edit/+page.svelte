<script lang="ts">
  import { page } from "$app/state";

  const eventId = $derived(page.params.id);
</script>

<main>
  <h1>Edit Event</h1>
  <p>Editing event ID: {eventId}</p>

  <a href="/manage-event">← Back to Manage Event</a>
</main>
