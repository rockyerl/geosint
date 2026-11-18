import * as dotenv from "dotenv";
dotenv.config();

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import * as schema from "./schema";

const dbUrl = process.env.DATABASE_URL || "file:local.db";
const client = createClient({ url: dbUrl });
const db = drizzle(client, { schema });

async function seed() {
  console.log("🌱 Starting Geomedik Kemhan RI database seeding...");

  // 1. Permissions Definition
  const permissionsList = [
    // Dashboard & GIS
    {
      id: "perm-dash-view",
      code: "dashboard.view",
      name: "Lihat Dashboard Eksekutif",
      group: "Dashboard & GIS",
      description: "Akses ke halaman ringkasan eksekutif dan indikator nasional Geomedik",
    },
    {
      id: "perm-gis-view",
      code: "gis.view",
      name: "Lihat Peta Geomedik (GIS)",
      group: "Dashboard & GIS",
      description: "Akses peta interaktif sebaran fasilitas dan sumber daya kesehatan",
    },
    // Master Organisasi
    {
      id: "perm-org-read",
      code: "organizations.read",
      name: "Lihat Master Organisasi",
      group: "Kelembagaan & Faskes",
      description: "Melihat struktur organisasi Kemhan, Mabes TNI, Matra, dan Kotama/Satker",
    },
    {
      id: "perm-org-manage",
      code: "organizations.manage",
      name: "Kelola Master Organisasi",
      group: "Kelembagaan & Faskes",
      description: "Menambah dan mengubah data master organisasi/satuan",
    },
    // Fasilitas Kesehatan & Verifikasi
    {
      id: "perm-fac-read",
      code: "facilities.read",
      name: "Lihat Fasilitas Kesehatan",
      group: "Kelembagaan & Faskes",
      description: "Melihat daftar fasilitas kesehatan beserta titik koordinat dan kapasitas",
    },
    {
      id: "perm-fac-manage",
      code: "facilities.manage",
      name: "Kelola & Input Faskes",
      group: "Kelembagaan & Faskes",
      description: "Menambah dan memperbarui data faskes serta koordinat lokasi",
    },
    {
      id: "perm-fac-verify",
      code: "facilities.verify",
      name: "Verifikasi & Persetujuan Data",
      group: "Kelembagaan & Faskes",
      description: "Menyetujui, meminta perbaikan, atau menolak pengajuan data faskes",
    },
    // Sumber Daya Kesehatan (SDM, Alkes, Matkes)
    {
      id: "perm-res-read",
      code: "resources.read",
      name: "Lihat SDM, Alkes & Matkes",
      group: "Sumber Daya Kesehatan",
      description: "Melihat rekap SDM kesehatan, inventaris alkes, dan stok matkes",
    },
    {
      id: "perm-res-manage",
      code: "resources.manage",
      name: "Kelola SDM, Alkes & Matkes",
      group: "Sumber Daya Kesehatan",
      description: "Menambah dan memperbarui data SDM, alat kesehatan, dan material kesehatan",
    },
    // Users Management
    {
      id: "perm-users-read",
      code: "users.read",
      name: "Lihat Daftar Pengguna",
      group: "Manajemen Pengguna",
      description: "Akses melihat menu dan data pengguna sistem",
    },
    {
      id: "perm-users-create",
      code: "users.create",
      name: "Tambah Pengguna",
      group: "Manajemen Pengguna",
      description: "Kemampuan membuat akun pengguna baru",
    },
    {
      id: "perm-users-edit",
      code: "users.edit",
      name: "Ubah Pengguna",
      group: "Manajemen Pengguna",
      description: "Kemampuan memperbarui data dan status pengguna",
    },
    {
      id: "perm-users-delete",
      code: "users.delete",
      name: "Hapus Pengguna",
      group: "Manajemen Pengguna",
      description: "Kemampuan menghapus akun pengguna",
    },
    // Roles Management
    {
      id: "perm-roles-read",
      code: "roles.read",
      name: "Lihat Role & Hak Akses",
      group: "Manajemen Role",
      description: "Akses melihat menu dan data role/peran",
    },
    {
      id: "perm-roles-manage",
      code: "roles.manage",
      name: "Kelola Role & Permissions",
      group: "Manajemen Role",
      description: "Kemampuan membuat, mengedit izin menu, dan menghapus role",
    },
    // Reports & Audit
    {
      id: "perm-reports-view",
      code: "reports.view",
      name: "Lihat Laporan & Audit Trail",
      group: "Laporan",
      description: "Akses ke menu laporan rekapitulasi dan jejak audit sistem",
    },
  ];

  console.log("-> Seeding permissions...");
  for (const perm of permissionsList) {
    await db
      .insert(schema.permissions)
      .values(perm)
      .onConflictDoUpdate({
        target: schema.permissions.id,
        set: {
          code: perm.code,
          name: perm.name,
          group: perm.group,
          description: perm.description,
        },
      });
  }

  // 2. Navigation Menus Definition (for dynamic sidebar)
  const menusList = [
    {
      id: "menu-dashboard",
      title: "Dashboard Eksekutif",
      path: "/dashboard",
      icon: "LayoutDashboard",
      requiredPermission: "dashboard.view",
      category: "Utama & Spasial",
      sortOrder: 1,
      isActive: true,
    },
    {
      id: "menu-gis",
      title: "Peta Geomedik (GIS)",
      path: "/dashboard/gis",
      icon: "Map",
      requiredPermission: "gis.view",
      category: "Utama & Spasial",
      sortOrder: 2,
      isActive: true,
    },
    {
      id: "menu-organizations",
      title: "Master Organisasi",
      path: "/dashboard/organizations",
      icon: "Building2",
      requiredPermission: "organizations.read",
      category: "Kelembagaan & Faskes",
      sortOrder: 3,
      isActive: true,
    },
    {
      id: "menu-facilities",
      title: "Fasilitas Kesehatan",
      path: "/dashboard/facilities",
      icon: "Hospital",
      requiredPermission: "facilities.read",
      category: "Kelembagaan & Faskes",
      sortOrder: 4,
      isActive: true,
    },
    {
      id: "menu-verification",
      title: "Verifikasi & Persetujuan",
      path: "/dashboard/verification",
      icon: "ClipboardCheck",
      requiredPermission: "facilities.verify",
      category: "Kelembagaan & Faskes",
      sortOrder: 5,
      isActive: true,
    },
    {
      id: "menu-personnel",
      title: "SDM Kesehatan",
      path: "/dashboard/personnel",
      icon: "Stethoscope",
      requiredPermission: "resources.read",
      category: "Sumber Daya Kesehatan",
      sortOrder: 6,
      isActive: true,
    },
    {
      id: "menu-equipment",
      title: "Alat Kesehatan (Alkes)",
      path: "/dashboard/equipment",
      icon: "Activity",
      requiredPermission: "resources.read",
      category: "Sumber Daya Kesehatan",
      sortOrder: 7,
      isActive: true,
    },
    {
      id: "menu-materials",
      title: "Material Kesehatan",
      path: "/dashboard/materials",
      icon: "PackageCheck",
      requiredPermission: "resources.read",
      category: "Sumber Daya Kesehatan",
      sortOrder: 8,
      isActive: true,
    },
    {
      id: "menu-reports",
      title: "Pelaporan & Audit Trail",
      path: "/dashboard/reports",
      icon: "FileBarChart",
      requiredPermission: "reports.view",
      category: "Administrasi & Audit",
      sortOrder: 9,
      isActive: true,
    },
    {
      id: "menu-users",
      title: "Manajemen Pengguna",
      path: "/dashboard/users",
      icon: "Users",
      requiredPermission: "users.read",
      category: "Administrasi & Audit",
      sortOrder: 10,
      isActive: true,
    },
    {
      id: "menu-roles",
      title: "Role & Hak Akses",
      path: "/dashboard/roles",
      icon: "ShieldCheck",
      requiredPermission: "roles.read",
      category: "Administrasi & Audit",
      sortOrder: 11,
      isActive: true,
    },
  ];

  console.log("-> Seeding navigation menus...");
  for (const menu of menusList) {
    await db
      .insert(schema.navigationMenus)
      .values(menu)
      .onConflictDoUpdate({
        target: schema.navigationMenus.id,
        set: {
          title: menu.title,
          path: menu.path,
          icon: menu.icon,
          requiredPermission: menu.requiredPermission,
          category: menu.category,
          sortOrder: menu.sortOrder,
          isActive: menu.isActive,
        },
      });
  }

  // 3. Roles Definition
  const now = new Date();
  const superAdminRoleId = "role-superadmin";
  const adminRoleId = "role-admin";
  const staffRoleId = "role-staff";

  console.log("-> Seeding default roles...");
  const rolesData = [
    {
      id: superAdminRoleId,
      name: "Super Admin Pusdatin / Kemhan",
      code: "SUPER_ADMIN",
      description: "Akses penuh ke seluruh modul Geomedik, verifikasi, dan konfigurasi RBAC",
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: adminRoleId,
      name: "Verifikator Ditkes Ditjen Kuathan",
      code: "ADMIN",
      description: "Memverifikasi data faskes, mengelola sumber daya kesehatan, dan pengguna",
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: staffRoleId,
      name: "Operator Faskes / Kesdam Daerah",
      code: "STAFF",
      description: "Input data faskes, SDM, alkes, matkes, dan pemantauan peta Geomedik",
      isSystem: false,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const r of rolesData) {
    await db
      .insert(schema.roles)
      .values(r)
      .onConflictDoUpdate({
        target: schema.roles.id,
        set: {
          name: r.name,
          description: r.description,
          updatedAt: now,
        },
      });
  }

  // 4. Role - Permissions Assignment
  console.log("-> Assigning permissions to roles...");
  await db.delete(schema.rolePermissions);

  const superAdminRolePerms = permissionsList.map((p) => ({
    id: randomUUID(),
    roleId: superAdminRoleId,
    permissionId: p.id,
  }));

  const adminAllowedPermCodes = [
    "dashboard.view",
    "gis.view",
    "organizations.read",
    "organizations.manage",
    "facilities.read",
    "facilities.manage",
    "facilities.verify",
    "resources.read",
    "resources.manage",
    "reports.view",
    "users.read",
    "users.create",
    "users.edit",
    "roles.read",
  ];
  const adminRolePerms = permissionsList
    .filter((p) => adminAllowedPermCodes.includes(p.code))
    .map((p) => ({
      id: randomUUID(),
      roleId: adminRoleId,
      permissionId: p.id,
    }));

  const staffAllowedPermCodes = [
    "dashboard.view",
    "gis.view",
    "organizations.read",
    "facilities.read",
    "facilities.manage",
    "resources.read",
    "resources.manage",
    "reports.view",
  ];
  const staffRolePerms = permissionsList
    .filter((p) => staffAllowedPermCodes.includes(p.code))
    .map((p) => ({
      id: randomUUID(),
      roleId: staffRoleId,
      permissionId: p.id,
    }));

  await db
    .insert(schema.rolePermissions)
    .values([...superAdminRolePerms, ...adminRolePerms, ...staffRolePerms]);

  // 5. Default Users
  console.log("-> Seeding default users with secure bcrypt hash...");
  const defaultPasswordHash = bcrypt.hashSync("Password123!", 10);

  const defaultUsers = [
    {
      id: "user-superadmin",
      name: "Kolonel Ckm Dr. Hendra Wijaya (Pusdatin)",
      email: "superadmin@sundawa.id",
      passwordHash: defaultPasswordHash,
      roleId: superAdminRoleId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "user-admin",
      name: "Letkol Laut (K) Budi Santoso (Verifikator Ditkes)",
      email: "admin@sundawa.id",
      passwordHash: defaultPasswordHash,
      roleId: adminRoleId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "user-staff",
      name: "Mayor Kes Siti Rahma (Operator Faskes)",
      email: "staff@sundawa.id",
      passwordHash: defaultPasswordHash,
      roleId: staffRoleId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const user of defaultUsers) {
    await db
      .insert(schema.users)
      .values(user)
      .onConflictDoUpdate({
        target: schema.users.id,
        set: {
          name: user.name,
          email: user.email,
          passwordHash: user.passwordHash,
          roleId: user.roleId,
          isActive: user.isActive,
          updatedAt: now,
        },
      });
  }

  // 6. Seed Modul 3: Master Data Organisasi
  console.log("-> Seeding Master Organisasi Kemhan & TNI...");
  const orgsData: schema.NewOrganization[] = [
    {
      id: "org-kemhan-kuathan",
      code: "KEMHAN-KUATHAN",
      name: "Ditkes Ditjen Kuathan Kemhan RI",
      category: "KEMHAN",
      level: "PUSAT",
      parentId: null,
      province: "DKI Jakarta",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "org-kemhan-pusrehab",
      code: "KEMHAN-PUSREHAB",
      name: "Pusat Rehabilitasi Kemhan RI",
      category: "KEMHAN",
      level: "PUSAT",
      parentId: "org-kemhan-kuathan",
      province: "DKI Jakarta",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "org-mabes-puskes",
      code: "MABES-PUSKESTNI",
      name: "Pusat Kesehatan TNI (Puskes TNI)",
      category: "MABES_TNI",
      level: "PUSAT",
      parentId: null,
      province: "DKI Jakarta",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "org-ad-puskesad",
      code: "AD-PUSKESAD",
      name: "Pusat Kesehatan TNI AD (Puskesad)",
      category: "TNI_AD",
      level: "MATRA",
      parentId: "org-mabes-puskes",
      province: "DKI Jakarta",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "org-al-diskesal",
      code: "AL-DISKESAL",
      name: "Dinas Kesehatan TNI AL (Diskesal)",
      category: "TNI_AL",
      level: "MATRA",
      parentId: "org-mabes-puskes",
      province: "DKI Jakarta",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "org-au-diskesau",
      code: "AU-DISKESAU",
      name: "Dinas Kesehatan TNI AU (Diskesau)",
      category: "TNI_AU",
      level: "MATRA",
      parentId: "org-mabes-puskes",
      province: "DKI Jakarta",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "org-ad-kesdam-iv",
      code: "AD-KESDAM-IV",
      name: "Kesdam IV/Diponegoro",
      category: "TNI_AD",
      level: "KOTAMA",
      parentId: "org-ad-puskesad",
      province: "Jawa Tengah",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "org-ad-kesdam-xiv",
      code: "AD-KESDAM-XIV",
      name: "Kesdam XIV/Hasanuddin",
      category: "TNI_AD",
      level: "KOTAMA",
      parentId: "org-ad-puskesad",
      province: "Sulawesi Selatan",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const org of orgsData) {
    await db
      .insert(schema.organizations)
      .values(org)
      .onConflictDoUpdate({
        target: schema.organizations.id,
        set: {
          code: org.code,
          name: org.name,
          category: org.category,
          level: org.level,
          parentId: org.parentId,
          province: org.province,
          isActive: org.isActive,
          updatedAt: now,
        },
      });
  }

  // 7. Seed Modul 4 & 9: Fasilitas Kesehatan (dengan titik koordinat GIS nasional)
  console.log("-> Seeding Fasilitas Kesehatan Geomedik...");
  const facilitiesData: schema.NewHealthFacility[] = [
    {
      id: "fac-rspad-gatot",
      code: "FASKES-AD-001",
      name: "RSPAD Gatot Soebroto",
      organizationId: "org-ad-puskesad",
      category: "RS_TINGKAT_I",
      province: "DKI Jakarta",
      city: "Jakarta Pusat",
      address: "Jl. Abdul Rahman Saleh No. 24, Senen, Jakarta Pusat",
      latitude: -6.1764,
      longitude: 106.8378,
      bedCapacity: 850,
      operationalStatus: "OPERASIONAL",
      services: "IGD Trauma Center, Bedah Saraf, Jantung Terpadu, ICU/NICU, Kedokteran Militer",
      verificationStatus: "APPROVED",
      verificationNote: "Data terverifikasi penuh sesuai laporan TW4.",
      verifiedBy: "Letkol Laut (K) Budi Santoso",
      verifiedAt: now,
      reportingPeriod: "2026-TW4",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "fac-rs-suyoto",
      code: "FASKES-KH-001",
      name: "RS dr. Suyoto Pusrehab Kemhan",
      organizationId: "org-kemhan-pusrehab",
      category: "RS_TINGKAT_I",
      province: "DKI Jakarta",
      city: "Jakarta Selatan",
      address: "Jl. RC. Veteran Raya No. 178, Bintaro, Pesanggrahan, Jakarta Selatan",
      latitude: -6.2678,
      longitude: 106.7663,
      bedCapacity: 420,
      operationalStatus: "OPERASIONAL",
      services:
        "Rehabilitasi Medik Terpadu, Prostetik & Ortotik Militer, IGD 24 Jam, Bedah Orthopedi",
      verificationStatus: "APPROVED",
      verificationNote: "Lengkap dan valid.",
      verifiedBy: "Letkol Laut (K) Budi Santoso",
      verifiedAt: now,
      reportingPeriod: "2026-TW4",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "fac-rsal-mintohardjo",
      code: "FASKES-AL-001",
      name: "RSAL Dr. Mintohardjo",
      organizationId: "org-al-diskesal",
      category: "RS_TINGKAT_I",
      province: "DKI Jakarta",
      city: "Jakarta Pusat",
      address: "Jl. Bendungan Hilir No. 17, Tanah Abang, Jakarta Pusat",
      latitude: -6.2105,
      longitude: 106.8115,
      bedCapacity: 480,
      operationalStatus: "OPERASIONAL",
      services: "Kedokteran Hiperbarik & Penyelaman, IGD, ICU, Hemodialisa, Bedah Sentral",
      verificationStatus: "APPROVED",
      verificationNote: "Data kapasitas ruang hiperbarik telah diperbarui.",
      verifiedBy: "Letkol Laut (K) Budi Santoso",
      verifiedAt: now,
      reportingPeriod: "2026-TW4",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "fac-rspal-ramelan",
      code: "FASKES-AL-002",
      name: "RSPAL dr. Ramelan Surabaya",
      organizationId: "org-al-diskesal",
      category: "RS_TINGKAT_I",
      province: "Jawa Timur",
      city: "Kota Surabaya",
      address: "Jl. Gadung No. 1, Jagir, Wonokromo, Surabaya",
      latitude: -7.3095,
      longitude: 112.7382,
      bedCapacity: 650,
      operationalStatus: "OPERASIONAL",
      services: "Rujukan Wilayah Timur TNI AL, Hiperbarik, Onkologi, Trauma Laut, ICU",
      verificationStatus: "APPROVED",
      verificationNote: "Data terverifikasi.",
      verifiedBy: "Letkol Laut (K) Budi Santoso",
      verifiedAt: now,
      reportingPeriod: "2026-TW4",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "fac-rspau-hardjolukito",
      code: "FASKES-AU-001",
      name: "RSPAU dr. S. Hardjolukito",
      organizationId: "org-au-diskesau",
      category: "RS_TINGKAT_I",
      province: "DI Yogyakarta",
      city: "Kab. Bantul",
      address: "Jl. Ringroad Timur, Banguntapan, Bantul, DI Yogyakarta",
      latitude: -7.7972,
      longitude: 110.4158,
      bedCapacity: 380,
      operationalStatus: "OPERASIONAL",
      services: "Aeromedis & Evakuasi Udara, Trauma Center, Jantung, ICU, Radiologi",
      verificationStatus: "APPROVED",
      verificationNote: "Kesiapan evakuasi medis udara terverifikasi.",
      verifiedBy: "Letkol Laut (K) Budi Santoso",
      verifiedAt: now,
      reportingPeriod: "2026-TW4",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "fac-rst-soedjono",
      code: "FASKES-AD-004",
      name: "RST Tk. II dr. Soedjono Magelang",
      organizationId: "org-ad-kesdam-iv",
      category: "RS_TINGKAT_II",
      province: "Jawa Tengah",
      city: "Kota Magelang",
      address: "Jl. Urip Sumoharjo No. 48, Wates, Magelang Utara",
      latitude: -7.4682,
      longitude: 110.2215,
      bedCapacity: 260,
      operationalStatus: "OPERASIONAL",
      services: "IGD 24 Jam, Bedah Umum, Penyakit Dalam, Dukungan Kesehatan Akademi Militer",
      verificationStatus: "SUBMITTED",
      verificationNote: "Menunggu verifikasi penambahan 20 tempat tidur ICU baru.",
      verifiedBy: null,
      verifiedAt: null,
      reportingPeriod: "2026-TW4",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "fac-rst-pelamonia",
      code: "FASKES-AD-014",
      name: "RS Tk. II Pelamonia Makassar",
      organizationId: "org-ad-kesdam-xiv",
      category: "RS_TINGKAT_II",
      province: "Sulawesi Selatan",
      city: "Kota Makassar",
      address: "Jl. Jend. Sudirman No. 27, Pisang Utara, Ujung Pandang, Makassar",
      latitude: -5.1385,
      longitude: 119.4142,
      bedCapacity: 310,
      operationalStatus: "SIAGA_DARURAT",
      services: "Rujukan Regional Indonesia Timur, Trauma & Evakuasi Medis, IGD, Hemodialisa",
      verificationStatus: "APPROVED",
      verificationNote: "Status Siaga Darurat untuk dukungan operasi wilayah timur.",
      verifiedBy: "Letkol Laut (K) Budi Santoso",
      verifiedAt: now,
      reportingPeriod: "2026-TW4",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "fac-rst-putrihijau",
      code: "FASKES-AD-002",
      name: "RS Tk. II Putri Hijau Medan",
      organizationId: "org-ad-puskesad",
      category: "RS_TINGKAT_II",
      province: "Sumatera Utara",
      city: "Kota Medan",
      address: "Jl. Putri Hijau No. 17, Kesawan, Medan Barat, Kota Medan",
      latitude: 3.5978,
      longitude: 98.6738,
      bedCapacity: 290,
      operationalStatus: "OPERASIONAL",
      services: "IGD, Bedah Orthopedi, ICU, Evakuasi Medis Wilayah Barat",
      verificationStatus: "SUBMITTED",
      verificationNote: "Pembaruan data SDM dokter spesialis dan alkes radiologi.",
      verifiedBy: null,
      verifiedAt: null,
      reportingPeriod: "2026-TW4",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "fac-rumkit-latumeten",
      code: "FASKES-AD-016",
      name: "Rumkit Tk. III dr. J.A. Latumeten Ambon",
      organizationId: "org-ad-kesdam-xiv",
      category: "RS_TINGKAT_III",
      province: "Maluku",
      city: "Kota Ambon",
      address: "Jl. Dr. Tamaela, Silale, Nusaniwe, Kota Ambon",
      latitude: -3.6954,
      longitude: 128.1814,
      bedCapacity: 160,
      operationalStatus: "RENOVASI",
      services: "IGD, Rawat Inap, Poliklinik Spesialis Dasar, Kesehatan Kepulauan",
      verificationStatus: "NEEDS_REVISION",
      verificationNote:
        "Mohon lampirkan berita acara kapasitas TT selama masa renovasi gedung utama.",
      verifiedBy: "Letkol Laut (K) Budi Santoso",
      verifiedAt: now,
      reportingPeriod: "2026-TW4",
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const fac of facilitiesData) {
    await db
      .insert(schema.healthFacilities)
      .values(fac)
      .onConflictDoUpdate({
        target: schema.healthFacilities.id,
        set: {
          code: fac.code,
          name: fac.name,
          organizationId: fac.organizationId,
          category: fac.category,
          province: fac.province,
          city: fac.city,
          address: fac.address,
          latitude: fac.latitude,
          longitude: fac.longitude,
          bedCapacity: fac.bedCapacity,
          operationalStatus: fac.operationalStatus,
          services: fac.services,
          verificationStatus: fac.verificationStatus,
          verificationNote: fac.verificationNote,
          verifiedBy: fac.verifiedBy,
          verifiedAt: fac.verifiedAt,
          reportingPeriod: fac.reportingPeriod,
          updatedAt: now,
        },
      });
  }

  // 8. Seed Modul 5: Data SDM Kesehatan
  console.log("-> Seeding SDM Kesehatan...");
  const personnelData: schema.NewMedicalPersonnel[] = [
    {
      id: "sdm-001",
      facilityId: "fac-rspad-gatot",
      professionCategory: "DOKTER_SPESIALIS",
      specialization: "Bedah Trauma, Saraf & Orthopedi",
      militaryCount: 48,
      civilCount: 34,
      totalAvailable: 82,
      standardRequirement: 85,
      certificationNote: "ATLS, Combat Trauma Surgery, Fellowship Bedah Vaskular",
      verificationStatus: "APPROVED",
      reportingPeriod: "2026-TW4",
      updatedAt: now,
    },
    {
      id: "sdm-002",
      facilityId: "fac-rspad-gatot",
      professionCategory: "PERAWAT",
      specialization: "Keperawatan Kritis (ICU/IGD) & Bedah",
      militaryCount: 210,
      civilCount: 380,
      totalAvailable: 590,
      standardRequirement: 600,
      certificationNote: "BTCLS, Keperawatan Intensif Kemhan",
      verificationStatus: "APPROVED",
      reportingPeriod: "2026-TW4",
      updatedAt: now,
    },
    {
      id: "sdm-003",
      facilityId: "fac-rs-suyoto",
      professionCategory: "DOKTER_SPESIALIS",
      specialization: "Kedokteran Fisik & Rehabilitasi Medik (Sp.KFR)",
      militaryCount: 14,
      civilCount: 22,
      totalAvailable: 36,
      standardRequirement: 40,
      certificationNote: "Rehabilitasi Cedera Tempur & Prostetik",
      verificationStatus: "APPROVED",
      reportingPeriod: "2026-TW4",
      updatedAt: now,
    },
    {
      id: "sdm-004",
      facilityId: "fac-rsal-mintohardjo",
      professionCategory: "DOKTER_SPESIALIS",
      specialization: "Kedokteran Kelautan & Hiperbarik",
      militaryCount: 26,
      civilCount: 12,
      totalAvailable: 38,
      standardRequirement: 42,
      certificationNote: "Underwater & Hyperbaric Medicine",
      verificationStatus: "APPROVED",
      reportingPeriod: "2026-TW4",
      updatedAt: now,
    },
    {
      id: "sdm-005",
      facilityId: "fac-rspau-hardjolukito",
      professionCategory: "PARAMEDIS_MILITER",
      specialization: "Perawat Evakuasi Medis Udara (Flight Nurse)",
      militaryCount: 45,
      civilCount: 15,
      totalAvailable: 60,
      standardRequirement: 75,
      certificationNote: "Aeromedical Evacuation & Critical Care Transport",
      verificationStatus: "APPROVED",
      reportingPeriod: "2026-TW4",
      updatedAt: now,
    },
    {
      id: "sdm-006",
      facilityId: "fac-rst-pelamonia",
      professionCategory: "DOKTER_UMUM",
      specialization: "Dokter Umum & Kesehatan Lapangan",
      militaryCount: 28,
      civilCount: 14,
      totalAvailable: 42,
      standardRequirement: 50,
      certificationNote: "ATLS, ACLS, Combat Medic Supervisor",
      verificationStatus: "APPROVED",
      reportingPeriod: "2026-TW4",
      updatedAt: now,
    },
    {
      id: "sdm-007",
      facilityId: "fac-rumkit-latumeten",
      professionCategory: "DOKTER_SPESIALIS",
      specialization: "Anestesiologi & Terapi Intensif",
      militaryCount: 2,
      civilCount: 1,
      totalAvailable: 3,
      standardRequirement: 8,
      certificationNote: "Kekurangan dokter spesialis anestesi untuk wilayah kepulauan",
      verificationStatus: "NEEDS_REVISION",
      reportingPeriod: "2026-TW4",
      updatedAt: now,
    },
  ];

  for (const sdm of personnelData) {
    await db
      .insert(schema.medicalPersonnel)
      .values(sdm)
      .onConflictDoUpdate({
        target: schema.medicalPersonnel.id,
        set: {
          facilityId: sdm.facilityId,
          professionCategory: sdm.professionCategory,
          specialization: sdm.specialization,
          militaryCount: sdm.militaryCount,
          civilCount: sdm.civilCount,
          totalAvailable: sdm.totalAvailable,
          standardRequirement: sdm.standardRequirement,
          certificationNote: sdm.certificationNote,
          verificationStatus: sdm.verificationStatus,
          updatedAt: now,
        },
      });
  }

  // 9. Seed Modul 6: Data Alat Kesehatan (Alkes)
  console.log("-> Seeding Alat Kesehatan (Alkes)...");
  const equipmentData: schema.NewMedicalEquipment[] = [
    {
      id: "alkes-001",
      code: "ALK-RSPAD-001",
      facilityId: "fac-rspad-gatot",
      category: "RADIOLOGI_IMAGING",
      name: "MRI 3.0 Tesla Magnetom & CT Scan 256 Slice",
      totalUnits: 4,
      goodConditionUnits: 4,
      minorDamageUnits: 0,
      majorDamageUnits: 0,
      operationalStatus: "BERFUNGSI",
      procurementYear: 2024,
      nextMaintenanceDate: "2027-03-15",
      verificationStatus: "APPROVED",
      updatedAt: now,
    },
    {
      id: "alkes-002",
      code: "ALK-AL-001",
      facilityId: "fac-rsal-mintohardjo",
      category: "HIPERBARIK_AEROMEDIS",
      name: "Multiplace Hyperbaric Oxygen Chamber (RUBT)",
      totalUnits: 3,
      goodConditionUnits: 2,
      minorDamageUnits: 1,
      majorDamageUnits: 0,
      operationalStatus: "PERLU_KALIBRASI",
      procurementYear: 2021,
      nextMaintenanceDate: "2026-12-10",
      verificationStatus: "APPROVED",
      updatedAt: now,
    },
    {
      id: "alkes-003",
      code: "ALK-AU-001",
      facilityId: "fac-rspau-hardjolukito",
      category: "EVAKUASI_LAPANGAN",
      name: "Aeromedical Evacuation Patient Transport Unit (PTU)",
      totalUnits: 8,
      goodConditionUnits: 7,
      minorDamageUnits: 1,
      majorDamageUnits: 0,
      operationalStatus: "BERFUNGSI",
      procurementYear: 2023,
      nextMaintenanceDate: "2027-01-20",
      verificationStatus: "APPROVED",
      updatedAt: now,
    },
    {
      id: "alkes-004",
      code: "ALK-KH-001",
      facilityId: "fac-rs-suyoto",
      category: "BEDAH_ANESTESI",
      name: "Robotic Gait Training & Exoskeleton Rehab System",
      totalUnits: 5,
      goodConditionUnits: 5,
      minorDamageUnits: 0,
      majorDamageUnits: 0,
      operationalStatus: "BERFUNGSI",
      procurementYear: 2025,
      nextMaintenanceDate: "2027-06-01",
      verificationStatus: "APPROVED",
      updatedAt: now,
    },
    {
      id: "alkes-005",
      code: "ALK-AD-014",
      facilityId: "fac-rst-pelamonia",
      category: "ICU_RESUSITASI",
      name: "Ventilator Transport & ICU High-Care",
      totalUnits: 18,
      goodConditionUnits: 14,
      minorDamageUnits: 3,
      majorDamageUnits: 1,
      operationalStatus: "DALAM_PERBAIKAN",
      procurementYear: 2022,
      nextMaintenanceDate: "2026-11-30",
      verificationStatus: "APPROVED",
      updatedAt: now,
    },
    {
      id: "alkes-006",
      code: "ALK-AD-016",
      facilityId: "fac-rumkit-latumeten",
      category: "RADIOLOGI_IMAGING",
      name: "Mobile Digital X-Ray Unit Lapangan",
      totalUnits: 2,
      goodConditionUnits: 0,
      minorDamageUnits: 1,
      majorDamageUnits: 1,
      operationalStatus: "RUSAK_BERAT",
      procurementYear: 2019,
      nextMaintenanceDate: "2026-11-25",
      verificationStatus: "NEEDS_REVISION",
      updatedAt: now,
    },
  ];

  for (const alkes of equipmentData) {
    await db
      .insert(schema.medicalEquipment)
      .values(alkes)
      .onConflictDoUpdate({
        target: schema.medicalEquipment.id,
        set: {
          code: alkes.code,
          facilityId: alkes.facilityId,
          category: alkes.category,
          name: alkes.name,
          totalUnits: alkes.totalUnits,
          goodConditionUnits: alkes.goodConditionUnits,
          minorDamageUnits: alkes.minorDamageUnits,
          majorDamageUnits: alkes.majorDamageUnits,
          operationalStatus: alkes.operationalStatus,
          procurementYear: alkes.procurementYear,
          nextMaintenanceDate: alkes.nextMaintenanceDate,
          verificationStatus: alkes.verificationStatus,
          updatedAt: now,
        },
      });
  }

  // 10. Seed Modul 7: Data Material Kesehatan (Matkes)
  console.log("-> Seeding Material Kesehatan (Matkes)...");
  const materialsData: schema.NewMedicalMaterial[] = [
    {
      id: "mat-001",
      code: "MAT-IFAK-001",
      facilityId: "fac-rspad-gatot",
      category: "TRAUMA_COMBAT_KIT",
      name: "Individual First Aid Kit (IFAK) Standar Militer (Tourniquet & Hemostatic)",
      unit: "Paket",
      stockQuantity: 1450,
      minThreshold: 500,
      storageLocation: "Gudang Logistik Pusat Kesad",
      expiryDate: "2028-12-31",
      stockStatus: "AMAN",
      verificationStatus: "APPROVED",
      updatedAt: now,
    },
    {
      id: "mat-002",
      code: "MAT-PLASMA-002",
      facilityId: "fac-rst-pelamonia",
      category: "REAGEN_DARAH",
      name: "Human Albumin 20% & kantong darah trauma darurat",
      unit: "Botol",
      stockQuantity: 65,
      minThreshold: 120,
      storageLocation: "Instalasi Bank Darah & Depo IGD Makassar",
      expiryDate: "2027-04-15",
      stockStatus: "MENIPIS",
      verificationStatus: "APPROVED",
      updatedAt: now,
    },
    {
      id: "mat-003",
      code: "MAT-BMHP-003",
      facilityId: "fac-rspal-ramelan",
      category: "BMHP_BEDAH",
      name: "Set Implan Trauma Orthopedi & Benang Bedah Darurat",
      unit: "Box",
      stockQuantity: 320,
      minThreshold: 150,
      storageLocation: "Depo Farmasi Bedah Sentral Surabaya",
      expiryDate: "2028-06-20",
      stockStatus: "AMAN",
      verificationStatus: "APPROVED",
      updatedAt: now,
    },
    {
      id: "mat-004",
      code: "MAT-OBAT-004",
      facilityId: "fac-rumkit-latumeten",
      category: "OBAT_ESENSIAL",
      name: "Antibiotik Spektrum Luas Injeksi & Analgesik Trauma",
      unit: "Vial",
      stockQuantity: 28,
      minThreshold: 200,
      storageLocation: "Gudang Farmasi Rumkit Ambon",
      expiryDate: "2027-02-10",
      stockStatus: "KRITIS",
      verificationStatus: "APPROVED",
      updatedAt: now,
    },
    {
      id: "mat-005",
      code: "MAT-CBRN-005",
      facilityId: "fac-rspau-hardjolukito",
      category: "APD_CBRN",
      name: "APD Dekontaminasi & Autoinjector Antidotum Nubika (CBRN)",
      unit: "Paket",
      stockQuantity: 90,
      minThreshold: 100,
      storageLocation: "Depo Siaga Nubika Lanud Adisutjipto",
      expiryDate: "2027-09-01",
      stockStatus: "MENIPIS",
      verificationStatus: "APPROVED",
      updatedAt: now,
    },
  ];

  for (const mat of materialsData) {
    await db
      .insert(schema.medicalMaterials)
      .values(mat)
      .onConflictDoUpdate({
        target: schema.medicalMaterials.id,
        set: {
          code: mat.code,
          facilityId: mat.facilityId,
          category: mat.category,
          name: mat.name,
          unit: mat.unit,
          stockQuantity: mat.stockQuantity,
          minThreshold: mat.minThreshold,
          storageLocation: mat.storageLocation,
          expiryDate: mat.expiryDate,
          stockStatus: mat.stockStatus,
          verificationStatus: mat.verificationStatus,
          updatedAt: now,
        },
      });
  }

  console.log("✅ Seeding Sistem Informasi Geomedik completed successfully!");
  console.log("==================================================");
  console.log("Demo Credentials:");
  console.log("1. Super Admin (Pusdatin Kemhan) : superadmin@sundawa.id / Password123!");
  console.log("2. Verifikator (Ditkes Kuathan)  : admin@sundawa.id / Password123!");
  console.log("3. Operator Faskes / Kesdam      : staff@sundawa.id / Password123!");
  console.log("==================================================");
}

seed()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
