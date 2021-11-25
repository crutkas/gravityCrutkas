<template>
  <div>
        <b-table :items="issueSummary" :fields="fields" striped hover />
  </div>
</template>

<script>
export default {
  props: {
    issueSummary
  }
}
</script>