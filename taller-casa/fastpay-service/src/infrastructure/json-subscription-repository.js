
const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_FILE = path.join(
  __dirname,
  '../../data/subscriptions.json'
);

class JsonSubscriptionRepository {
  constructor(file = DEFAULT_FILE) {
    this.file = file;
  }

  getAll() {
    return JSON.parse(fs.readFileSync(this.file, 'utf8'));
  }

  saveAll(subscriptions) {
    const temporaryFile = `${this.file}.tmp`;

    fs.writeFileSync(
      temporaryFile,
      JSON.stringify(subscriptions, null, 2)
    );

    fs.renameSync(temporaryFile, this.file);
  }
}

module.exports = JsonSubscriptionRepository;
