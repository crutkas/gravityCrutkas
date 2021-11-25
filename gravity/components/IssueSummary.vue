<template>
  <div>
        <b-table :items="issueSummary" :fields="fields" striped hover>
          <template #cell(title)="data">
            <a :href="{{ data.url }}">{{ data.title }}</a>
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