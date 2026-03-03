export default {
  en: {
    shortFormat: {
      dateStyle: "short"
    },
    longFormat: {
      year: 'numeric', month: 'short', day: 'numeric',
      weekday: 'short', hour: 'numeric', minute: 'numeric'
    },
    mounthFormat: {
      day: 'numeric', month: 'long',
    },
    mounthYFormat: {
      day: 'numeric', month: 'long', year: 'numeric',
    },
    DMY: {
      day: '2-digit', month: '2-digit', year: 'numeric',
    },
    day: {
      day: '2-digit',
    },
    month: {
      month: '2-digit',
    },
    year: {
      year: 'numeric',
    }
  },
  ru: {
    shortFormat: {
      dateStyle: "short"
    },
    longFormat: {
      year: 'numeric', month: 'short', day: 'numeric',
      weekday: 'short', hour: 'numeric', minute: 'numeric'
    },
    mounthFormat: {
      day: 'numeric', month: 'long',
    },
    mounthYFormat: {
      day: 'numeric', month: 'long', year: 'numeric',
    },
    DMY: {
      day: '2-digit', month: '2-digit', year: 'numeric',
    },
    day: {
      day: '2-digit',
    },
    month: {
      month: '2-digit',
    },
    year: {
      year: 'numeric',
    }
  }
} as const