# MedPoint Project Synopsis

## Overview

MedPoint is a browser-based pharmacy and medical-store management application designed to bring day-to-day dispensary work into one interface. It helps pharmacy teams keep medicine records organized, locate products quickly, process counter sales, and monitor stock and operating activity.

## Purpose

Pharmacies handle many products with different batches, expiry dates, storage locations, prices, and prescription requirements. Tracking these details manually can slow service and make stock oversight difficult. MedPoint brings product, sales, and operational information together so staff can make routine decisions from a shared dashboard.

## Main capabilities

- **Dashboard and reporting:** Review sales and revenue trends, best-selling medicines, inventory status, and branch-filtered activity.
- **Medicine inventory:** Add, edit, search, and remove medicine records; track quantities, minimum stock levels, batch numbers, expiry dates, prescription requirements, and rack, box, and shelf locations.
- **Shelf finder:** Search for a medicine and use its recorded storage location to find it in the pharmacy.
- **Point of sale:** Build a basket, record customer and dispensing details, apply discounts, select a payment method and staff member, complete a sale, and produce a receipt.
- **Sales history:** Review completed transactions and process refunds, with related stock and movement records updated in the application.
- **Staff management:** Maintain sales staff records and view sales performance and duty status.
- **Pharmacy operations:** Record stock movements, manage suppliers and purchase orders, receive deliveries, and prepare daily closings and shift handovers.
- **Multi-branch context:** Represent multiple pharmacy branches and associate sales and operational records with a branch.
- **Data backup and restore:** Export the browser's current MedPoint records to a JSON backup and restore a supported backup after confirmation.
- **Batch-level stock:** Record separate batch numbers, expiry dates, costs, and quantities when restocking. Sales consume eligible batches in earliest-expiry-first order; refunds restore the recorded batch allocations.
- **Expiry safeguards:** Highlight expired and soon-to-expire batches in stock alerts and prevent expired batches from being sold.
- **Audit trail:** Record medicine creation, edits, deletion, stock changes, completed sales, and refunds with a timestamp, staff label, and details.
- **Prototype notice:** Clearly tell users that the app uses sample records and browser-local storage.

## Intended users

The application is intended for pharmacy owners, managers, pharmacists, and counter staff who need a straightforward way to coordinate inventory, dispensing, sales, and routine store operations.

## Implementation and current scope

MedPoint is implemented as a React and TypeScript single-page web application, built with Vite and styled with Tailwind CSS. Its records are initialized from sample data and saved in the browser's local storage. Users can export and restore a JSON backup, but application records are not yet synchronized across devices or branches. A Supabase schema starter is provided in `SUPABASE_SETUP.sql`; connecting the app to it still requires project configuration and explicit approval to transfer pharmacy records. Production use also requires tested authentication, role enforcement, and a server-backed audit trail. The included records are examples and should not be treated as live pharmacy data.
