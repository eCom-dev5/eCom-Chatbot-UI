import React from "react";
import styles from "./ProductFeedItem.module.css";

function ProductFeedItem({ product }) {
  const { name, price, imageUrl, rating, badge } = product; // Destructure product details

  return (
    <div className={styles.feedItem}>
      <div className={styles.imageContainer}>
        {badge && <span className={styles.badge}>{badge}</span>} {/* Badge for labels */}
        <img src={imageUrl} alt={name} className={styles.image} />
      </div>
      <div className={styles.textContainer}>
        <a href={`/products/${product.id}`} className={styles.nameLink}>
          <h3 className={styles.productTitle}>{name}</h3>
        </a>
        <div className={styles.ratingContainer}>
          <span className={styles.ratingStars}>⭐ {rating}</span> {/* Display rating */}
        </div>
        <p className={styles.price}>${price}</p>
        <button className={styles.button}>Add to Cart</button>
      </div>
    </div>
  );
}

export default ProductFeedItem;
