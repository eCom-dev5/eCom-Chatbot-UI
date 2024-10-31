import { Link } from "react-router-dom";

import { ProductData } from "./productData";
import { getProductDetailPath } from "./utils";
import StarRating from "../../components/StarRating/StarRating";

import utilStyles from "../../App/utilStyles.module.css";
import styles from "./ProductFeedItem.module.css";

// Updated `ProductFeedItemProps` to include `userId`
type ProductFeedItemProps = {
  productData: ProductData;
  userId: string; // NEW: Add userId as a prop
};

export default function ProductFeedItem({ productData, userId }: ProductFeedItemProps) {
  const detailPath = getProductDetailPath(productData.parent_asin, productData.title);
  const { average_rating, rating_number, price, thumb, hi_res } = productData;

  return (
    <article className={styles.feedItem}>
      <Link to={detailPath}>
        <div className={styles.imageContainer}>
          <img
            src={hi_res}
            alt={productData.title}
            height="500"
            width="500"
            className={styles.image}
          />
        </div>
      </Link>
      <div className={styles.textContainer}>
        <div className={utilStyles.mb1rem}>
          <Link to={detailPath} className={styles.nameLink}>
            <strong className={`${utilStyles.regularWeight} ${utilStyles.XLText}`}>
              {productData.title}
            </strong>
          </Link>
        </div>
        {average_rating ? (
          <div className={styles.ratingContainer}>
            <StarRating rating={average_rating} />
            <span className={styles.rating_number}>
              {rating_number}
              {parseFloat(rating_number) > 1 ? " ratings" : " rating"}
            </span>
          </div>
        ) : null}
        <div className={styles.price}>{price}</div>
      </div>
    </article>
  );
}
