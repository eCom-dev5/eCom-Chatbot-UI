-- DDL for table user_reviews
CREATE TABLE public.user_reviews (
rating text NULL,
title text NULL,
text text NULL,
images text NULL,
asin text NULL,
parent_asin text NULL,
user_id text NULL,
timestamp text NULL,
helpful_vote text NULL,
verified_purchase text NULL
);

-- DDL for table user_reviews_temp
CREATE TABLE public.user_reviews_temp (
rating text NULL,
title text NULL,
text text NULL,
images text NULL,
asin text NULL,
parent_asin text NULL,
user_id text NULL,
timestamp text NULL,
helpful_vote text NULL,
verified_purchase text NULL
);

-- DDL for table productimages
CREATE TABLE public.productimages (
parent_asin text NULL,
thumb text NULL,
hi_res text NULL,
large_res text NULL
);

-- DDL for table userreviews
CREATE TABLE public.userreviews (
rating text NULL,
title text NULL,
text text NULL,
asin text NULL,
parent_asin text NULL,
user_id text NULL,
timestamp text NULL,
helpful_vote text NULL,
verified_purchase text NULL
);

-- DDL for table productmetadata
CREATE TABLE public.productmetadata (
parent_asin text NOT NULL,
title text NULL,
average_rating text NULL,
rating_number text NULL,
features text NULL,
description text NULL,
price text NULL,
store text NULL,
details text NULL,
main_category text NULL
);

ALTER TABLE public.productmetadata ADD PRIMARY KEY (parent_asin);
ALTER TABLE public.productmetadata ADD CONSTRAINT fk_parent_asin FOREIGN KEY (parent_asin) REFERENCES public.productmetadata(parent_asin);
-- DDL for table cart_products
CREATE TABLE public.cart_products (
user_id integer NOT NULL,
product_id text NOT NULL,
quantity smallint NOT NULL
);

ALTER TABLE public.cart_products ADD PRIMARY KEY (user_id, product_id);
ALTER TABLE public.cart_products ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES public.cart_products(product_id);
ALTER TABLE public.cart_products ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES public.cart_products(user_id);
ALTER TABLE public.cart_products ADD CONSTRAINT fk_product_id FOREIGN KEY (product_id) REFERENCES public.cart_products(product_id);
ALTER TABLE public.cart_products ADD CONSTRAINT fk_product_id FOREIGN KEY (product_id) REFERENCES public.cart_products(user_id);
ALTER TABLE public.cart_products ADD CONSTRAINT fk_product_id FOREIGN KEY (product_id) REFERENCES public.productmetadata(parent_asin);
ALTER TABLE public.cart_products ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES public.users(id);
-- DDL for table users
CREATE TABLE public.users (
id integer NOT NULL,
email_address character varying(100) NOT NULL,
hashed_pw text NULL,
auth_method character varying(50) NOT NULL
);

ALTER TABLE public.users ADD PRIMARY KEY (id);
ALTER TABLE public.users ADD CONSTRAINT fk_email_address FOREIGN KEY (email_address) REFERENCES public.users(email_address);
ALTER TABLE public.users ADD CONSTRAINT fk_id FOREIGN KEY (id) REFERENCES public.users(id);
-- DDL for table orders
CREATE TABLE public.orders (
id integer NOT NULL,
user_id integer NULL,
address_id integer NULL,
order_placed_time timestamp without time zone NOT NULL,
status character varying(100) NOT NULL,
total_cost money NOT NULL
);

ALTER TABLE public.orders ADD PRIMARY KEY (id);
ALTER TABLE public.orders ADD CONSTRAINT fk_id FOREIGN KEY (id) REFERENCES public.orders(id);
ALTER TABLE public.orders ADD CONSTRAINT fk_address_id FOREIGN KEY (address_id) REFERENCES public.addresses(id);
ALTER TABLE public.orders ADD CONSTRAINT fk_address_id FOREIGN KEY (address_id) REFERENCES public.addresses(id);
ALTER TABLE public.orders ADD CONSTRAINT fk_address_id FOREIGN KEY (address_id) REFERENCES public.addresses(id);
ALTER TABLE public.orders ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE public.orders ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES public.users(id);
-- DDL for table order_products
CREATE TABLE public.order_products (
order_id integer NOT NULL,
parent_asin text NOT NULL,
product_quantity smallint NOT NULL
);

ALTER TABLE public.order_products ADD PRIMARY KEY (order_id, parent_asin);
ALTER TABLE public.order_products ADD CONSTRAINT fk_order_id FOREIGN KEY (order_id) REFERENCES public.order_products(parent_asin);
ALTER TABLE public.order_products ADD CONSTRAINT fk_order_id FOREIGN KEY (order_id) REFERENCES public.order_products(order_id);
ALTER TABLE public.order_products ADD CONSTRAINT fk_parent_asin FOREIGN KEY (parent_asin) REFERENCES public.order_products(parent_asin);
ALTER TABLE public.order_products ADD CONSTRAINT fk_parent_asin FOREIGN KEY (parent_asin) REFERENCES public.order_products(order_id);
ALTER TABLE public.order_products ADD CONSTRAINT fk_order_id FOREIGN KEY (order_id) REFERENCES public.orders(id);
ALTER TABLE public.order_products ADD CONSTRAINT fk_parent_asin FOREIGN KEY (parent_asin) REFERENCES public.productmetadata(parent_asin);
-- DDL for table addresses
CREATE TABLE public.addresses (
id integer NOT NULL,
address character varying(300) NOT NULL,
postcode character varying(8) NOT NULL
);

ALTER TABLE public.addresses ADD PRIMARY KEY (id);
ALTER TABLE public.addresses ADD CONSTRAINT fk_address FOREIGN KEY (address) REFERENCES public.addresses(postcode);
ALTER TABLE public.addresses ADD CONSTRAINT fk_address FOREIGN KEY (address) REFERENCES public.addresses(address);
ALTER TABLE public.addresses ADD CONSTRAINT fk_postcode FOREIGN KEY (postcode) REFERENCES public.addresses(postcode);
ALTER TABLE public.addresses ADD CONSTRAINT fk_postcode FOREIGN KEY (postcode) REFERENCES public.addresses(address);
ALTER TABLE public.addresses ADD CONSTRAINT fk_id FOREIGN KEY (id) REFERENCES public.addresses(id);
-- DDL for table user_sessions
CREATE TABLE public.user_sessions (
sid character varying NOT NULL,
sess jsonb NOT NULL,
expire timestamp without time zone NOT NULL,
user_id integer NOT NULL
);

ALTER TABLE public.user_sessions ADD PRIMARY KEY (sid);
ALTER TABLE public.user_sessions ADD CONSTRAINT fk_sid FOREIGN KEY (sid) REFERENCES public.user_sessions(sid);
ALTER TABLE public.user_sessions ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES public.users(id);
-- DDL for table productcategories
CREATE TABLE public.productcategories (
parent_asin text NULL,
categories text NULL,
main_category character varying(255) NULL
);

-- DDL for table metadata
CREATE TABLE public.metadata (
main_category text NULL,
title text NULL,
average_rating text NULL,
rating_number text NULL,
features text NULL,
description text NULL,
price text NULL,
images text NULL,
videos text NULL,
store text NULL,
categories text NULL,
details text NULL,
parent_asin text NULL,
bought_together text NULL,
subtitle text NULL,
author text NULL
);

