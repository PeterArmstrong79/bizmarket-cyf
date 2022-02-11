import React, { useEffect, useState } from "react";
import {
	useSearchParams,
	useLocation,
	useNavigate,
	useParams,
} from "react-router-dom";
import { useContextBM } from "../context/Context";
import styles from "./CategoryPage.module.scss";

import BizMarketApi from "../api/BizMarketApi";
import Filters from "../components/Filters";
import AdCard from "../components/AdCard";

const SearchResultPage = () => {
	const {
		categories,
		currentSearchResult,
		setCurrentSearchResult,
		isFilterOpen,
		setIsFilterOpen,
		filterByPrice,
	} = useContextBM();

	const [searchParams, setSearchParams] = useSearchParams();
	const queryString = searchParams.get("query");
	const categoryId = searchParams.get("categoryId");

	console.log(categoryId);
	let categoryName;
	if (categoryId && categoryId !== "0") {
		categoryName = categories.filter(
			(category) => category.id === +categoryId
		)[0].name;
	}

	console.log(categoryName);

	const location = useLocation();
	const navigate = useNavigate();

	// Filter set up
	let min, max;
	if (currentSearchResult) {
		max =
			filterByPrice.max === 0
				? currentSearchResult
						.map((item) => {
							return item.price;
						})
						.reduce((a, b) => {
							return Math.max(a, b);
						})
				: filterByPrice.max;
		min =
			filterByPrice.min === 0
				? currentSearchResult
						.map((item) => {
							return item.price;
						})
						.reduce((a, b) => {
							return Math.min(a, b);
						})
				: filterByPrice.min;
	}

	useEffect(() => {
		window.scrollTo(0, 0);
		const fetchData = async () => {
			try {
				const response = await BizMarketApi.get("/viewads", {
					queryString: queryString,
					categoryId: categoryId,
				});
				setCurrentSearchResult(response.data.results);
			} catch (error) {
				console.error(error);
			}
		};
		fetchData();
	}, []);

	const handleFiltersOpen = () => {
		isFilterOpen ? setIsFilterOpen(false) : setIsFilterOpen(true);
	};
	const [sortWay, setSortWay] = useState("most popular");

	return (
		<div className={styles.container}>
			<div className={styles.inner}>
				<Filters />
				{currentSearchResult ? (
					<div className={styles.content}>
						<div className={styles["top-bar"]}>
							<h1 className={styles.h1}>
								{!queryString
									? "Recent ads from all categories:"
									: `${
											currentSearchResult.length
									  } results for "${queryString}" from ${
											categoryId === "0"
												? "all categories"
												: `category ${categoryName}`
									  }`}
							</h1>
							<div className={styles.options}>
								<span
									onClick={handleFiltersOpen}
									className={styles["filters-toggle"]}
								>
									Filters
								</span>
								<div className={styles["sort-wrap"]}>
									<span>Sort by: </span>
									<span> {sortWay}</span>
								</div>
							</div>
						</div>
						<div className={styles.ads}>
							{/* {currentSearchResult.map((ad) => {
								return <AdCard product={ad} key={ad.id} />;
							})} */}
							{currentSearchResult.map((ad) => {
								return (
									<>
										{ad.price >= min && ad.price <= max ? (
											<AdCard ad={ad} key={ad.id} />
										) : null}
									</>
								);
							})}
						</div>
					</div>
				) : (
					"Nothing is here"
				)}
			</div>
		</div>
	);
};

export default SearchResultPage;
