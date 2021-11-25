<template>
  <div>
        <b-table :items="issueSummary" :fields="fields" striped hover>
          <template #cell(title)="data">
            <b-link :href="data.item.url">data.item.title</b-link>
          </template>
        </b-table>
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
            sortable: true
          },
        ]}
  },
}
</script>