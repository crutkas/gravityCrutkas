<template>
  <div>
        <b-table :items="issueSummary" :fields="fields" striped hover />
  </div>
</template>

<script>
export default {
  props: [ 'issueSummary' ],
  data() {
      return {
        fields: [
          {
            key: 'title',
            sortable: true
          },
          {
            key: 'referencedIn',
            sortable: false
          },
        ]}
  };
}
</script>