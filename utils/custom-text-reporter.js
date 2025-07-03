const fs = require('fs');
const path = require('path');

class ErrorReporter {
  constructor() {
    this.failures = [];
  }

  /**
   * Utility to clean ANSI color codes from terminal messages
   * @param {string} str
   * @returns {string}
   */
  stripAnsi(str) {
    return str.replace(
      // Regex to remove ANSI escape sequences
      /\x1b\[([0-9]{1,3}(;[0-9]{1,3})?)?[mGK]/g,
      ''
    );
  }

  onTestEnd(test, result) {
    if (result.status !== 'failed') return;

    const testTitle = test.title;
    const location = `${test.location.file}:${test.location.line}`;

    // Extract method trace from stack
    let methodLine = 'Unknown';
    if (result.error?.stack) {
      const lines = result.error.stack.split('\n');
      const relevant = lines.find(line => line.includes('at '));
      if (relevant) methodLine = relevant.trim();
    }

    // Clean up ANSI characters from error message
    const rawMsg = result.error?.message || 'No error message';
    const errorMsg = this.stripAnsi(rawMsg.split('\n')[0]);

    const formatted = [
      `❌ Test Failed: ${testTitle}`,
      `📄 Location   : ${location}`,
      `🔹 Method     : ${methodLine}`,
      `📝 Error      : ${errorMsg}`,
      '--------------------------------------------------'
    ].join('\n');

    this.failures.push(formatted);
  }

  onEnd() {
    const reportPath = path.join(process.cwd(), 'playwright-error-report.txt');
    fs.writeFileSync(reportPath, this.failures.join('\n\n'), 'utf-8');
    console.log(`📄 Error report written to: ${reportPath}`);
  }
}

module.exports = ErrorReporter;
