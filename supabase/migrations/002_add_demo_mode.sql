-- Add demo_mode column to users table
alter table users add column demo_mode boolean default false;
