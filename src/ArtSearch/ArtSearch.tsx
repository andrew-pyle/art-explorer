import { Component, JSX } from "preact";
import debounce from "just-debounce-it";
import shuffle from "just-shuffle";
import style from "./style.module.css";
import { ArtworkSearchHandler } from "../lib/types";
import metTags from "../lib/MetTags.json";
import memoize from "just-memoize";

// Types

interface Props {
	onSubmit: ArtworkSearchHandler;
}

interface State {
	query: string;
	year: number;
	yearRange: number;
	suggestions: string[];
}

/**
 *
 */
export class ArtSearch extends Component<Props> {
	state: State = {
		query: "woman",
		year: 1500,
		yearRange: 100,
		suggestions: [],
	};

	componentDidMount(): void {
		const [minYear, maxYear] = this.calculateYearRange(
			this.state.year,
			this.state.yearRange,
		);
		this.props.onSubmit(this.state.query, { minYear, maxYear });
	}

	handleSubmit = (event: JSX.TargetedEvent<HTMLFormElement>) => {
		event.preventDefault();
		this.#handleSubmitDebounced();
	};

	#handleSubmitDebounced = debounce(() => {
		const [minYear, maxYear] = this.calculateYearRange(
			this.state.year,
			this.state.yearRange,
		);
		this.props.onSubmit(this.state.query, { minYear, maxYear });
	}, 400);

	handleYearSliderInput = (event: Event) => {
		event.preventDefault();
		if (!(event.target instanceof HTMLInputElement)) {
			throw new Error(
				"Event handler attached to improper element. I was expecting an HTMLInputElement",
			);
		}
		const input = event.target;
		const year = Number(input.value);
		this.setState({ year }, () => input.form?.requestSubmit());
	};

	handleQueryInput = (event: Event) => {
		event.preventDefault();
		if (!(event.target instanceof HTMLInputElement)) {
			throw new Error(
				"Event handler attached to improper element. I was expecting an HTMLInputElement",
			);
		}
		const input = event.target;
		const query = input.value;
		this.setState({ query }, () => input.form?.requestSubmit());
	};

	calculateYearRange = (year: number, yearRange: number) => {
		const naiveMin = year - yearRange;
		const zeroFloorMin = naiveMin < 0 ? 0 : naiveMin;
		const naiveMax = year + yearRange;
		return [zeroFloorMin, naiveMax];
	};

	autofillSuggestion = (suggestion: string) => {
		this.setState({ query: suggestion });
	};

	/**
	 * TODO: Empirically determine which tags have results on the API.
	 * Remove tags which don't have results on the API. It's a bad experience
	 * to click a suggestion and see no results.
	 */
	#generateSuggestions = memoize((tags: string[], query: string) => {
		// if (query.length < 2) {
		// 	return [];
		// }
		const matchingTags = tags.filter((tag) => new RegExp(query, "i").test(tag));
		return shuffle(matchingTags).slice(0, 10);
	});

	render() {
		const [minYear, maxYear] = this.calculateYearRange(
			this.state.year,
			this.state.yearRange,
		);
		const suggestions = this.#generateSuggestions(metTags, this.state.query);
		return (
			<form class={style["search-form"]} onSubmit={this.handleSubmit}>
				<div class={[style["form-row"], style["year-control"]].join(" ")}>
					<label for="year" id="year-control-label">
						Year of Artwork
					</label>
					<input
						type="range"
						name="year"
						id="year"
						min="0"
						max="2100"
						step="50"
						list="year-tick-marks"
						value={this.state.year}
						onInput={this.handleYearSliderInput}
					/>
					{/* See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range#adding_labels */}
					<datalist id="year-tick-marks">
						<option value="0">0</option>
						<option value="50">50</option>
						<option value="100">100</option>
						<option value="150">150</option>
						<option value="200">200</option>
						<option value="250">250</option>
						<option value="300">300</option>
						<option value="350">350</option>
						<option value="400">400</option>
						<option value="450">450</option>
						<option value="500">500</option>
						<option value="550">550</option>
						<option value="600">600</option>
						<option value="650">650</option>
						<option value="700">700</option>
						<option value="750">750</option>
						<option value="800">800</option>
						<option value="850">850</option>
						<option value="900">900</option>
						<option value="950">950</option>
						<option value="1000">1000</option>
						<option value="1050">1050</option>
						<option value="1100">1100</option>
						<option value="1150">1150</option>
						<option value="1200">1200</option>
						<option value="1250">1250</option>
						<option value="1300">1300</option>
						<option value="1350">1350</option>
						<option value="1400">1400</option>
						<option value="1450">1450</option>
						<option value="1500">1500</option>
						<option value="1550">1550</option>
						<option value="1600">1600</option>
						<option value="1650">1650</option>
						<option value="1700">1700</option>
						<option value="1750">1750</option>
						<option value="1800">1800</option>
						<option value="1850">1850</option>
						<option value="1900">1900</option>
						<option value="1950">1950</option>
						<option value="2000">2000</option>
						<option value="2050">2050</option>
						<option value="2100">2100</option>
					</datalist>
					<output
						class={style["year-output"]}
						type="number"
						name="year-output-min"
						aria-label="earliest year of artwork"
						min="0"
						max="2100"
						step="50"
						value={minYear}
					/>{" "}
					<span>To</span>{" "}
					<output
						class={style["year-output"]}
						type="number"
						name="year-output-max"
						aria-label="latest year of artwork"
						min="0"
						max="2100"
						step="50"
						value={maxYear}
					/>
				</div>
				<div class={[style["input-and-button"], style["form-row"]].join(" ")}>
					<input
						class={style["search-bar"]}
						type="search"
						name="query"
						placeholder="Try woman, dog, or sunflower"
						value={this.state.query}
						onInput={this.handleQueryInput}
					/>
					<button type="submit">Search</button>
				</div>
				<div class={[style["form-row"], style["suggestions"]].join(" ")}>
					{this.state.query.length === 0 ? (
						<span class="help-text">
							Type in the search bar to see suggestions
						</span>
					) : (
						suggestions.map((suggestion) => (
							<button
								key={suggestion}
								onClick={() => this.autofillSuggestion(suggestion)}
							>
								{suggestion}
							</button>
						))
					)}
				</div>
			</form>
		);
	}
}
