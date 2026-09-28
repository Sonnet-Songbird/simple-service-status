CREATE TABLE `host` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hostname` text NOT NULL,
	`service_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`service_id`) REFERENCES `service`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `host_hostname_unique` ON `host` (`hostname`);--> statement-breakpoint
CREATE INDEX `host_service_id_idx` ON `host` (`service_id`);--> statement-breakpoint
CREATE TABLE `schedule` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`service_id` integer NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer NOT NULL,
	`notice_message` text NOT NULL,
	`lifecycle_state` text DEFAULT 'scheduled' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`service_id`) REFERENCES `service`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `schedule_lookup_idx` ON `schedule` (`service_id`,`lifecycle_state`,`starts_at`,`ends_at`);--> statement-breakpoint
CREATE TABLE `service` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`display_name` text NOT NULL,
	`description` text,
	`fallback_notice_message` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `service_slug_unique` ON `service` (`slug`);--> statement-breakpoint
CREATE TABLE `status_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`host_id` integer NOT NULL,
	`checked_at` integer NOT NULL,
	`check_status` text NOT NULL,
	`response_time_ms` integer,
	FOREIGN KEY (`host_id`) REFERENCES `host`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `status_log_host_checked_at_idx` ON `status_log` (`host_id`,`checked_at`);