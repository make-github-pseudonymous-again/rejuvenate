import process from 'node:process';

import logUpdate from 'log-update';
import chalk from 'chalk';
import figures from 'figures';
import indentString from 'indent-string';
import cliTruncate from 'cli-truncate';
import stripAnsi from 'strip-ansi';
import logSymbols from 'log-symbols';
import elegantSpinner from 'elegant-spinner';
import {deque} from '@data-structure/deque';
import {take} from '@iterable-iterator/slice';
import {list} from '@iterable-iterator/list';
import {iter} from '@iterable-iterator/iter';
import {filter} from '@iterable-iterator/filter';
import {count} from '@iterable-iterator/cardinality';

const spinners = new WeakMap();

const pointer = chalk.yellow(figures.pointer);
const skipped = chalk.yellow(figures.arrowDown);

const isDefined = (x) => x !== null && x !== undefined;

const getSymbol = (task, options, level) => {
	task.spinner ||= elegantSpinner();

	if (task.isPending()) {
		return options.maxSubtasks(level + 1) > 0 && task.subtasks.length > 0
			? pointer
			: chalk.yellow(task.spinner());
	}

	if (task.isCompleted()) {
		return logSymbols.success;
	}

	if (task.hasFailed()) {
		return task.subtasks.length > 0 ? pointer : logSymbols.error;
	}

	if (task.isSkipped()) {
		return task.output === 'postcondition' ? skipped : logSymbols.warning;
	}

	return ' ';
};

function* takeUntilPlusSome(pred, tasks, after) {
	const it = iter(tasks);
	for (const task of it) {
		yield task;
		if (pred(task)) break;
	}

	yield* take(it, after);
}

const frame = (tasks, n) =>
	n === Number.POSITIVE_INFINITY
		? tasks
		: deque(
				takeUntilPlusSome((t) => t.isPending(), tasks, Math.floor(n / 2)),
				n,
			);

const enabled = (tasks) => filter((t) => t.isEnabled(), tasks);
const isDone = (task) =>
	task.isSkipped() || task.isCompleted() || task.hasFailed();

const renderHelper = (tasks, options, level = 0) => {
	let output = [];
	const enabledTasks = list(enabled(tasks));
	const pending = count(filter((t) => !isDone(t), enabledTasks));
	let pendingButDisplayed = 0;
	for (const task of frame(enabledTasks, options.maxSubtasks(level))) {
		const enabledSubtasks = list(enabled(task.subtasks));
		const nsubtasks = count(enabledSubtasks);
		if (!isDone(task)) ++pendingButDisplayed;

		if (
			!task.isSkipped() &&
			options.maxSubtasks(level + 1) > 0 &&
			nsubtasks > 0
		) {
			const done = count(
				filter((t) => t.isCompleted() || t.isSkipped(), enabledSubtasks),
			);
			const ratio = ((done / nsubtasks) * 100).toFixed(0);
			const progress = `(${done}/${nsubtasks} ~ ${ratio}%)`;
			output.push(
				indentString(
					` ${getSymbol(task, options)} ${task.title} ${progress}`,
					level,
					{indent: ' '},
				),
			);
		} else {
			const skipped = task.isSkipped()
				? ` ${chalk.dim(`[${task.output || 'skipped'}]`)}`
				: '';
			output.push(
				indentString(
					` ${getSymbol(task, options, level)} ${task.title}${skipped}`,
					level,
					{indent: ' '},
				),
			);
		}

		if ((task.isPending() || task.hasFailed()) && isDefined(task.output)) {
			let data = task.output;

			if (typeof data === 'string') {
				data = stripAnsi(data.trim().split('\n').filter(Boolean).pop());

				if (data === '') {
					data = undefined;
				}
			}

			if (isDefined(data)) {
				const out = indentString(`${figures.arrowRight} ${data}`, level, {
					indent: ' ',
				});
				output.push(
					`   ${chalk.gray(cliTruncate(out, process.stdout.columns - 3))}`,
				);
			}
		}

		if (
			nsubtasks > 0 &&
			(task.hasFailed() ||
				((task.isPending() || !options.collapse(level)) &&
					options.maxSubtasks(level + 1) > 0))
		) {
			output = output.concat(renderHelper(task.subtasks, options, level + 1));
		}
	}

	if (options.maxSubtasks(level) > 0 && pending > pendingButDisplayed) {
		if (!spinners.has(tasks)) spinners.set(tasks, elegantSpinner());
		const spinner = spinners.get(tasks);
		output.push(
			indentString(
				` ${chalk.yellow(spinner())} ${
					pending - pendingButDisplayed
				} other tasks pending`,
				level,
				{indent: ' '},
			),
		);
	}

	return output.join('\n');
};

const render = (tasks, options) => {
	logUpdate(renderHelper(tasks, options));
};

export default class CustomRenderer {
	constructor(tasks, options) {
		this._tasks = tasks;
		this._options = Object.assign(
			{
				maxSubtasks: () => Number.POSITIVE_INFINITY,
				collapse: () => true,
				clearOutput: false,
			},
			options,
		);
	}

	render() {
		if (this._id) {
			// Do not render if we are already rendering
			return;
		}

		this._id = setInterval(() => {
			render(this._tasks, this._options);
		}, 100);
	}

	end(error) {
		if (this._id) {
			clearInterval(this._id);
			this._id = undefined;
		}

		render(this._tasks, this._options);

		if (this._options.clearOutput && error === undefined) {
			logUpdate.clear();
		} else {
			logUpdate.done();
		}
	}
}
