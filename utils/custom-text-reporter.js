const fs = require('fs');
const path = require('path');

class ErrorReporter {
    constructor() {
        this.failures = [];
    }

    stripAnsi(str) {
        return str.replace(/\x1b\[([0-9]{1,3}(;[0-9]{1,3})?)?[mGK]/g, '');
    }

    extractMethodName(stack) {
        if (!stack) return 'UnknownMethod';
        const match = stack.split('\n').find(line => line.includes('at ') && line.includes('.js:'));
        if (!match) return 'UnknownMethod';
        return match.trim().split('at ')[1].split(' ')[0];
    }

    extractFailedCode(stack) {
        if (!stack) return 'Unavailable';
        const match = stack.split('\n').find(line => line.includes('.js:') && line.includes('at '));
        if (!match) return 'Unavailable';

        const locationMatch = match.match(/(\/.*\.js):(\d+):(\d+)/);
        if (!locationMatch) return 'Unavailable';

        const [, file, lineNum] = locationMatch;
        try {
            const codeLines = fs.readFileSync(file, 'utf-8').split('\n');
            return codeLines[parseInt(lineNum, 10) - 1].trim();
        } catch {
            return 'Failed to read source code line';
        }
    }

    extractTimeoutMessage(errors) {
        if (!errors || !Array.isArray(errors)) return null;
        const timeoutError = errors.find(e => e.message?.includes('Test timeout of'));
        return timeoutError ? timeoutError.message : null;
    }

    onTestEnd(test, result) {
        if (result.status !== 'failed') return;

        const testTitle = test.title;
        const filePath = test.location?.file || 'UnknownFile';
        const lineNumber = test.location?.line || '0';
        const location = `${path.basename(filePath)}:${lineNumber}`;

        const timeoutMsg = this.extractTimeoutMessage(result.errors);
        const rawMsg = result.error?.message || timeoutMsg || 'No error message';
        const errorMsg = this.stripAnsi(rawMsg.split('\n')[0]);

        const methodName = this.extractMethodName(result.error?.stack);
        const failedCode = this.extractFailedCode(result.error?.stack);

        const formatted = [
            `${testTitle}`,
            `Location   : ${location}`,
            `Method     : ${methodName}`,
            `Failed At  : ${failedCode} - ${errorMsg}`,
            '--------------------------------------------------'
        ].join('\n');

        this.failures.push(formatted);
    }

    onEnd() {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }

    if (this.failures.length === 0) {
        fs.writeFileSync(path.join(logsDir, 'test-failure-report.txt'), 'Total Failed Tests: 0\n', 'utf-8');
        return;
    }

    const reportPath = path.join(logsDir, 'test-failure-report.txt');
    const header = `Total Failed Tests: ${this.failures.length}\n\n`;
    const content = header + this.failures.join('\n\n');

    fs.writeFileSync(reportPath, content, 'utf-8');
}

}

module.exports = ErrorReporter;
