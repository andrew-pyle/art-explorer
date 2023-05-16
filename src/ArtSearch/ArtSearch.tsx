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
	state: Readonly<State> = {
		query: "woman",
		year: 1500,
		yearRange: 100,
		suggestions: [],
	};
	minYear = -2000; // 2000 BCE
	maxYear = 2000; // 2000 CE

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
		const floorMin = naiveMin < this.minYear ? this.minYear : naiveMin;
		const naiveMax = year + yearRange;
		const floorMax = naiveMax > this.maxYear ? this.maxYear : naiveMax;
		// return [zeroFloorMin, naiveMax];
		return [floorMin, floorMax];
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
						min={this.minYear}
						max={this.maxYear}
						step="50"
						// list="year-tick-marks"
						value={this.state.year}
						onInput={this.handleYearSliderInput}
					/>
					<output
						class={style["year-output"]}
						type="text"
						name="year-output-min"
						aria-label="earliest year of artwork"
						value={`${Math.abs(minYear)} ${
							minYear < 0 ? "BCE" : "CE"
						}`.padStart(4, "&nbsp;")}
					/>{" "}
					<span>To</span>{" "}
					<output
						class={style["year-output"]}
						type="text"
						name="year-output-max"
						aria-label="latest year of artwork"
						value={`${Math.abs(maxYear)} ${
							maxYear < 0 ? "BCE" : "CE"
						}`.padStart(4, "&nbsp;")}
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
								type="button"
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
