--
-- PostgreSQL database dump
--

\restrict lZjF1NHc6V6SfXGACeHXopO078rwzpqxMcMW6da4NbG2qTzPy1tvZpdGXzhfbPR

-- Dumped from database version 16.14 (Homebrew)
-- Dumped by pg_dump version 16.14 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ContainerType; Type: TYPE; Schema: public; Owner: virgiseptian
--

CREATE TYPE public."ContainerType" AS ENUM (
    'WADAH',
    'KANTONG',
    'BAK',
    'MB'
);


ALTER TYPE public."ContainerType" OWNER TO virgiseptian;

--
-- Name: InspectionGeneralLevel; Type: TYPE; Schema: public; Owner: virgiseptian
--

CREATE TYPE public."InspectionGeneralLevel" AS ENUM (
    'I',
    'II',
    'III'
);


ALTER TYPE public."InspectionGeneralLevel" OWNER TO virgiseptian;

--
-- Name: UnitType; Type: TYPE; Schema: public; Owner: virgiseptian
--

CREATE TYPE public."UnitType" AS ENUM (
    'TABLET',
    'KAPLET',
    'KAPSUL',
    'SOFT_KAPSUL',
    'VIAL',
    'AMPUL',
    'BLISTER',
    'STRIP',
    'BOTOL',
    'KAFT'
);


ALTER TYPE public."UnitType" OWNER TO virgiseptian;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: virgiseptian
--

CREATE TABLE public.accounts (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public.accounts OWNER TO virgiseptian;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: virgiseptian
--

CREATE TABLE public.permissions (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.permissions OWNER TO virgiseptian;

--
-- Name: problem_findings; Type: TABLE; Schema: public; Owner: virgiseptian
--

CREATE TABLE public.problem_findings (
    id text NOT NULL,
    "verificationId" text NOT NULL,
    "position" integer NOT NULL,
    label text NOT NULL,
    "containerType" public."ContainerType" NOT NULL,
    "findingCount" integer NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.problem_findings OWNER TO virgiseptian;

--
-- Name: problem_verifications; Type: TABLE; Schema: public; Owner: virgiseptian
--

CREATE TABLE public.problem_verifications (
    id text NOT NULL,
    date date NOT NULL,
    "productCode" text NOT NULL,
    "batchNumber" text NOT NULL,
    location text NOT NULL,
    "aqlCriteria" text NOT NULL,
    "unitType" public."UnitType" NOT NULL,
    "generalLevel" public."InspectionGeneralLevel" NOT NULL,
    "sampleSize" integer NOT NULL,
    keterangan text,
    kesimpulan text,
    "createdById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.problem_verifications OWNER TO virgiseptian;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: virgiseptian
--

CREATE TABLE public.role_permissions (
    id text NOT NULL,
    "roleId" text NOT NULL,
    "permissionId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO virgiseptian;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: virgiseptian
--

CREATE TABLE public.roles (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO virgiseptian;

--
-- Name: sampling_histories; Type: TABLE; Schema: public; Owner: virgiseptian
--

CREATE TABLE public.sampling_histories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "productName" text,
    "batchNumber" text,
    "lotSize" integer NOT NULL,
    "letterCode" text NOT NULL,
    "sampleSize" integer NOT NULL,
    "inspectionLevel" text NOT NULL,
    "inspectionCode" text NOT NULL,
    "inspectionCodeLabel" text NOT NULL,
    "inspectionTypeLabel" text NOT NULL,
    "planCriticalAc" integer DEFAULT 0 NOT NULL,
    "planCriticalRe" integer DEFAULT 0 NOT NULL,
    "planMajorAc" integer DEFAULT 0 NOT NULL,
    "planMajorRe" integer DEFAULT 0 NOT NULL,
    "planMinorAc" integer DEFAULT 0 NOT NULL,
    "planMinorRe" integer DEFAULT 0 NOT NULL,
    "createdById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    decision text,
    "decisionReason" text,
    "defectCritical" integer DEFAULT 0,
    "defectMajor" integer DEFAULT 0,
    "defectMinor" integer DEFAULT 0
);


ALTER TABLE public.sampling_histories OWNER TO virgiseptian;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: virgiseptian
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO virgiseptian;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: virgiseptian
--

CREATE TABLE public.user_roles (
    id text NOT NULL,
    "userId" text NOT NULL,
    "roleId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_roles OWNER TO virgiseptian;

--
-- Name: users; Type: TABLE; Schema: public; Owner: virgiseptian
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text,
    email text NOT NULL,
    "emailVerified" timestamp(3) without time zone,
    image text,
    password text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO virgiseptian;

--
-- Name: verification_tokens; Type: TABLE; Schema: public; Owner: virgiseptian
--

CREATE TABLE public.verification_tokens (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.verification_tokens OWNER TO virgiseptian;

--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: virgiseptian
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: virgiseptian
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: problem_findings problem_findings_pkey; Type: CONSTRAINT; Schema: public; Owner: virgiseptian
--

ALTER TABLE ONLY public.problem_findings
    ADD CONSTRAINT problem_findings_pkey PRIMARY KEY (id);


--
-- Name: problem_verifications problem_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: virgiseptian
--

ALTER TABLE ONLY public.problem_verifications
    ADD CONSTRAINT problem_verifications_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: virgiseptian
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: virgiseptian
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sampling_histories sampling_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: virgiseptian
--

ALTER TABLE ONLY public.sampling_histories
    ADD CONSTRAINT sampling_histories_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: virgiseptian
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: virgiseptian
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: virgiseptian
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: accounts_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: virgiseptian
--

CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON public.accounts USING btree (provider, "providerAccountId");


--
-- Name: permissions_name_key; Type: INDEX; Schema: public; Owner: virgiseptian
--

CREATE UNIQUE INDEX permissions_name_key ON public.permissions USING btree (name);


--
-- Name: problem_findings_verificationId_position_key; Type: INDEX; Schema: public; Owner: virgiseptian
--

CREATE UNIQUE INDEX "problem_findings_verificationId_position_key" ON public.problem_findings USING btree ("verificationId", "position");


--
-- Name: problem_verifications_batchNumber_idx; Type: INDEX; Schema: public; Owner: virgiseptian
--

CREATE INDEX "problem_verifications_batchNumber_idx" ON public.problem_verifications USING btree ("batchNumber");


--
-- Name: problem_verifications_date_idx; Type: INDEX; Schema: public; Owner: virgiseptian
--

CREATE INDEX problem_verifications_date_idx ON public.problem_verifications USING btree (date);


--
-- Name: role_permissions_roleId_permissionId_key; Type: INDEX; Schema: public; Owner: virgiseptian
--

CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON public.role_permissions USING btree ("roleId", "permissionId");


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: virgiseptian
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: sampling_histories_createdat_idx; Type: INDEX; Schema: public; Owner: virgiseptian
--

CREATE INDEX sampling_histories_createdat_idx ON public.sampling_histories USING btree ("createdAt" DESC);


--
-- Name: sessions_sessionToken_key; Type: INDEX; Schema: public; Owner: virgiseptian
--

CREATE UNIQUE INDEX "sessions_sessionToken_key" ON public.sessions USING btree ("sessionToken");


--
-- Name: user_roles_userId_roleId_key; Type: INDEX; Schema: public; Owner: virgiseptian
--

CREATE UNIQUE INDEX "user_roles_userId_roleId_key" ON public.user_roles USING btree ("userId", "roleId");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: virgiseptian
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: verification_tokens_identifier_token_key; Type: INDEX; Schema: public; Owner: virgiseptian
--

CREATE UNIQUE INDEX verification_tokens_identifier_token_key ON public.verification_tokens USING btree (identifier, token);


--
-- Name: verification_tokens_token_key; Type: INDEX; Schema: public; Owner: virgiseptian
--

CREATE UNIQUE INDEX verification_tokens_token_key ON public.verification_tokens USING btree (token);


--
-- Name: accounts accounts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: virgiseptian
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: problem_findings problem_findings_verificationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: virgiseptian
--

ALTER TABLE ONLY public.problem_findings
    ADD CONSTRAINT "problem_findings_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES public.problem_verifications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: problem_verifications problem_verifications_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: virgiseptian
--

ALTER TABLE ONLY public.problem_verifications
    ADD CONSTRAINT "problem_verifications_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: role_permissions role_permissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: virgiseptian
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: virgiseptian
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sampling_histories sampling_histories_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: virgiseptian
--

ALTER TABLE ONLY public.sampling_histories
    ADD CONSTRAINT "sampling_histories_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: sessions sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: virgiseptian
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles user_roles_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: virgiseptian
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles user_roles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: virgiseptian
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict lZjF1NHc6V6SfXGACeHXopO078rwzpqxMcMW6da4NbG2qTzPy1tvZpdGXzhfbPR

