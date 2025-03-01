"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const SelectPage = () => {
    const [search, setSearch] = useState<string>("");

    const documents = [
        { name: "เอกสารแรก", path: "/documents/externalDocs", icon: "/doc-icon/google-docs.png" },
        { name: "เอกสารสอง", path: "/documents/seccondDoc", icon: "/doc-icon/paper.png" },
    ];
    const documentsnormal = [
        { name: "เอกสารแรกทั่วไป", path: "/documents/firstdoc", icon: "/doc-icon/google-docs.png" },
        { name: "เอกสารสองทั่วไป", path: "/documents/secconddoc", icon: "/doc-icon/paper.png" },
    ];
    const publicrelationsbook = [
        { name: "หนังสือแรกประชาสัมพันธ์", path: "/documents/firstdoc", icon: "/doc-icon/google-docs.png" },
        { name: "หนังสือสองประชาสัมพันธ์", path: "/documents/secconddoc", icon: "/doc-icon/paper.png" },
    ]

    const filteredDocs = documents.filter((doc) =>
        doc.name.toLowerCase().includes(search.toLowerCase())
    );
    const filteredDocsNormal = documentsnormal.filter((doc) =>
        doc.name.toLowerCase().includes(search.toLowerCase())
    );
    const filteredPublicrelationsbook = publicrelationsbook.filter((doc) =>
        doc.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col p-8 gap-8">
            <div className="flex w-full justify-center items-center gap-x-2">
                <label className="font-extrabold">ค้นหาเอกสาร:</label>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border px-2 py-2 rounded-md border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="พิมพ์ชื่อเอกสาร..."
                />
            </div>

            <div className="flex flex-col gap-2 w-full">
                <p className="font-bold">เอกสารราชการ</p>
                <div className="flex gap-4 w-full pl-4">
                    {filteredDocs.length > 0 ? (
                        filteredDocs.map((doc, index) => (
                            <Link
                                key={index}
                                href={doc.path}
                                className="flex flex-col w-fit gap-y-4 items-center justify-center p-8 border rounded-lg hover:bg-gray-100"
                            >
                                <Image src={doc.icon} alt={doc.name} width={100} height={100} />
                                <span>{doc.name}</span>
                            </Link>
                        ))
                    ) : (
                        <p className="text-gray-500">ไม่พบเอกสารที่ค้นหา</p>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
                <p className="font-bold">เอกสารทั่วไป</p>
                <div className="flex gap-4 w-full pl-4">
                    {filteredDocsNormal.length > 0 ? (
                        filteredDocsNormal.map((doc, index) => (
                            <Link
                                key={index}
                                href={doc.path}
                                className="flex flex-col w-fit gap-y-4 items-center justify-center p-8 border rounded-lg hover:bg-gray-100"
                            >
                                <Image src={doc.icon} alt={doc.name} width={100} height={100} />
                                <span>{doc.name}</span>
                            </Link>
                        ))
                    ) : (
                        <p className="text-gray-500">ไม่พบเอกสารที่ค้นหา</p>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
                <p className="font-bold">หนังสือประชาสัมพันธ์</p>
                <div className="flex gap-4 w-full pl-4">
                    {filteredPublicrelationsbook.length > 0 ? (
                        filteredPublicrelationsbook.map((doc, index) => (
                            <Link
                                key={index}
                                href={doc.path}
                                className="flex flex-col w-fit gap-y-4 items-center justify-center p-8 border rounded-lg hover:bg-gray-100"
                            >
                                <Image src={doc.icon} alt={doc.name} width={100} height={100} />
                                <span>{doc.name}</span>
                            </Link>
                        ))
                    ) : (
                        <p className="text-gray-500">ไม่พบเอกสารที่ค้นหา</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SelectPage;
