CREATE TABLE IF NOT EXISTS public.user (
   id_dataset integer NOT NULL,
   id_user serial NOT NULL,
   idx integer NOT NULL,
   id varchar(50) NOT NULL,
   n varchar(50) NOT NULL,
   x double precision NOT NULL,
   y double precision NOT NULL,
   brillo double precision NOT NULL,
   PRIMARY KEY (id_dataset, id_user)
);


CREATE TABLE IF NOT EXISTS public.dataset (
   id_dataset serial NOT NULL,
   name varchar(100) NOT NULL,
   PRIMARY KEY (id_dataset)
);


CREATE TABLE IF NOT EXISTS public.charts (
   id_dataset integer NOT NULL,
   id_chart serial NOT NULL,
   name varchar(100) NOT NULL,
   type_chart varchar(100) NOT NULL,
   PRIMARY KEY (id_dataset, id_chart)
);


CREATE TABLE IF NOT EXISTS public.titles_chart (
   id_dataset integer NOT NULL,
   id_chart integer NOT NULL,
   id_title serial NOT NULL,
   value varchar(150) NOT NULL,
   PRIMARY KEY (id_dataset, id_chart, id_title)
);


CREATE TABLE IF NOT EXISTS public.user_chart (
   id_dataset integer NOT NULL,
   id_user integer NOT NULL,
   id_chart integer NOT NULL,
   id_title integer NOT NULL,
   name varchar(150) NOT NULL,
   PRIMARY KEY (id_dataset, id_user, id_chart, id_title)
);


CREATE TABLE IF NOT EXISTS public.dimension (
   id_dataset integer NOT NULL,
   id_dim serial NOT NULL,
   name varchar(100) NOT NULL,
   PRIMARY KEY (id_dataset, id_dim)
);


CREATE TABLE IF NOT EXISTS public.user_dim (
   id_dataset integer NOT NULL,
   id_user integer NOT NULL,
   id_dim integer NOT NULL,
   value integer NOT NULL,
   value_heat double precision NOT NULL,
   PRIMARY KEY (id_dataset, id_user, id_dim)
);


CREATE TABLE IF NOT EXISTS public.object (
   id_dataset integer NOT NULL,
   id_object serial NOT NULL,
   title varchar(100) NOT NULL,
   PRIMARY KEY (id_dataset, id_object)
);


CREATE TABLE IF NOT EXISTS public.object_detail (
   id_dataset integer NOT NULL,
   id_object integer NOT NULL,
   id_title integer NOT NULL,
   value varchar(200) NOT NULL,
   PRIMARY KEY (id_dataset, id_object, id_title)
);


CREATE TABLE IF NOT EXISTS public.object_title (
   id_dataset integer NOT NULL,
   id_title serial NOT NULL,
   name varchar(100) NOT NULL,
   PRIMARY KEY (id_dataset, id_title)
);


CREATE TABLE IF NOT EXISTS public.rating (
   id_dataset integer NOT NULL,
   id_user integer NOT NULL,
   id_object integer NOT NULL,
   id_rating serial NOT NULL,
   value varchar(50) NOT NULL,
   PRIMARY KEY (id_dataset, id_user, id_object, id_rating)
);


CREATE TABLE IF NOT EXISTS public.evaluated_user_profile (
   id_dataset integer NOT NULL,
   id_evaluated_user integer NOT NULL,
   email varchar(50) NOT NULL,
   given_name varchar(100),
   family_name varchar(100),
   picture varchar(150),
   locale varchar(10),
   PRIMARY KEY (id_dataset, id_evaluated_user)
);

ALTER TABLE public.evaluated_user_profile
   ADD UNIQUE (email);


CREATE TABLE IF NOT EXISTS public.evaluated_user (
   id_dataset integer NOT NULL,
   id_evaluated_user serial NOT NULL,
   status integer NOT NULL,
   start_tour double precision,
   end_tour double precision,
   start_interaction double precision,
   end_interaction double precision,
   start_form double precision,
   end_form double precision,
   PRIMARY KEY (id_dataset, id_evaluated_user)
);


ALTER TABLE public.user DROP CONSTRAINT IF EXISTS FK_user__id_dataset;
ALTER TABLE public.user ADD CONSTRAINT FK_user__id_dataset FOREIGN KEY (id_dataset) REFERENCES public.dataset(id_dataset);

ALTER TABLE public.charts DROP CONSTRAINT IF EXISTS FK_charts__id_dataset;
ALTER TABLE public.charts ADD CONSTRAINT FK_charts__id_dataset FOREIGN KEY (id_dataset) REFERENCES public.dataset(id_dataset);

ALTER TABLE public.titles_chart DROP CONSTRAINT IF EXISTS FK_titles_chart__id_dataset__id_chart;
ALTER TABLE public.titles_chart ADD CONSTRAINT FK_titles_chart__id_dataset__id_chart FOREIGN KEY (id_dataset, id_chart) REFERENCES public.charts(id_dataset, id_chart);

ALTER TABLE public.user_chart DROP CONSTRAINT IF EXISTS FK_user_chart__id_dataset__id_user;
ALTER TABLE public.user_chart ADD CONSTRAINT FK_user_chart__id_dataset__id_user FOREIGN KEY (id_dataset, id_user) REFERENCES public.user(id_dataset, id_user);
ALTER TABLE public.user_chart DROP CONSTRAINT IF EXISTS FK_user_chart__id_dataset__id_chart__id_title;
ALTER TABLE public.user_chart ADD CONSTRAINT FK_user_chart__id_dataset__id_chart__id_title FOREIGN KEY (id_dataset, id_chart, id_title) REFERENCES public.titles_chart(id_dataset, id_chart, id_title);

ALTER TABLE public.dimension DROP CONSTRAINT IF EXISTS FK_dimension__id_dataset;
ALTER TABLE public.dimension ADD CONSTRAINT FK_dimension__id_dataset FOREIGN KEY (id_dataset) REFERENCES public.dataset(id_dataset);

ALTER TABLE public.user_dim DROP CONSTRAINT IF EXISTS FK_user_dim__id_dataset__id_user;
ALTER TABLE public.user_dim ADD CONSTRAINT FK_user_dim__id_dataset__id_user FOREIGN KEY (id_dataset, id_user) REFERENCES public.user(id_dataset, id_user);
ALTER TABLE public.user_dim DROP CONSTRAINT IF EXISTS FK_user_dim__id_dataset__id_dim;
ALTER TABLE public.user_dim ADD CONSTRAINT FK_user_dim__id_dataset__id_dim FOREIGN KEY (id_dataset, id_dim) REFERENCES public.dimension(id_dataset, id_dim);

ALTER TABLE public.object DROP CONSTRAINT IF EXISTS FK_object__id_dataset;
ALTER TABLE public.object ADD CONSTRAINT FK_object__id_dataset FOREIGN KEY (id_dataset) REFERENCES public.dataset(id_dataset);

ALTER TABLE public.object_title DROP CONSTRAINT IF EXISTS FK_object_title__id_dataset;
ALTER TABLE public.object_title ADD CONSTRAINT FK_object_title__id_dataset FOREIGN KEY (id_dataset) REFERENCES public.dataset(id_dataset);

ALTER TABLE public.object_detail DROP CONSTRAINT IF EXISTS FK_object_detail__id_dataset__id_object;
ALTER TABLE public.object_detail ADD CONSTRAINT FK_object_detail__id_dataset__id_object FOREIGN KEY (id_dataset, id_object) REFERENCES public.object(id_dataset, id_object);
ALTER TABLE public.object_detail DROP CONSTRAINT IF EXISTS FK_object_detail__id_dataset__id_title;
ALTER TABLE public.object_detail ADD CONSTRAINT FK_object_detail__id_dataset__id_title FOREIGN KEY (id_dataset, id_title) REFERENCES public.object_title(id_dataset, id_title);

ALTER TABLE public.rating DROP CONSTRAINT IF EXISTS FK_rating__id_dataset__id_user;
ALTER TABLE public.rating ADD CONSTRAINT FK_rating__id_dataset__id_user FOREIGN KEY (id_dataset, id_user) REFERENCES public.user(id_dataset, id_user);
ALTER TABLE public.rating DROP CONSTRAINT IF EXISTS FK_rating__id_dataset__id_object;
ALTER TABLE public.rating ADD CONSTRAINT FK_rating__id_dataset__id_object FOREIGN KEY (id_dataset, id_object) REFERENCES public.object(id_dataset, id_object);

ALTER TABLE public.evaluated_user DROP CONSTRAINT IF EXISTS FK_evaluated_user__id_dataset;
ALTER TABLE public.evaluated_user ADD CONSTRAINT FK_evaluated_user__id_dataset FOREIGN KEY (id_dataset) REFERENCES public.dataset(id_dataset);

ALTER TABLE public.evaluated_user_profile DROP CONSTRAINT IF EXISTS FK_evaluated_user_profile__id_dataset__id_evaluated_user;
ALTER TABLE public.evaluated_user_profile ADD CONSTRAINT FK_evaluated_user_profile__id_dataset__id_evaluated_user FOREIGN KEY (id_dataset, id_evaluated_user) REFERENCES public.evaluated_user(id_dataset, id_evaluated_user);
