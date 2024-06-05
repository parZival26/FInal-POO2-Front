"use client";


import React, { useEffect, useState } from "react";
import nookies from 'nookies';
import { useRouter } from 'next/navigation';
import Modal from 'react-modal';

interface DataItem {
    fecha: string;
    cedula: string;
    userId: string;
}

const getData = async (token: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/minero/salidas`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    });

    const data = await res.json();
    return data;
}

export default function salida() {
    const router = useRouter();
    const [data, setData] = useState<DataItem[]>([]);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [cedula, setCedula] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const token = nookies.get(nookies.get(null, 'token'))
        //check if the token is an empty object
        if (Object.keys(token).length === 0) {
            router.push("/auth/login");
        } else {
            getData(token.token).then((data) => {
                setData(data);
            }).catch((error) => {
                console.log(error);
            });

        }
    }, []);


    const openModal = () => {
        setIsOpen(true);
    }

    const closeModal = () => {
        setIsOpen(false);
        error && setError("")
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCedula(e.target.value);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/minero/salida`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${nookies.get(null, 'token').token}`
            },
            body: JSON.stringify({ cedula })
        })



        if (res.ok) {
            closeModal();
            getData(nookies.get(null, 'token').token).then((data) => {
                setData(data);
            }).catch((error) => {
                console.log(error);
            });
        } else {
            setError("Error al añadir el registro");
        }
    }


    return (
        <section className="text-gray-600 body-font overflow-hidden">
            <div className="container px-5 py-24 mx-auto">
                <button onClick={openModal} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded absolute top-0 right-0 m-6">
                    Añadir registro
                </button>
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    contentLabel="Añadir registro"
                    className="lg:w-2/6 md:w-1/2 bg-gray-100 rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                >
                    <button onClick={closeModal} className="absolute top-0 right-0 m-6">X</button>
                    <h2 className="text-gray-900 text-lg font-medium title-font mb-5">Añadir registro</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="relative mb-4">
                            <label htmlFor="cedula" className="leading-7 text-sm text-gray-600">Cedula</label>
                            <input type="text" id="cedula" name="cedula" onChange={handleChange} className="w-full bg-white rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                        </div>
                        <button type="submit" className="text-white bg-blue-500 border-0 py-2 px-8 focus:outline-none hover:bg-blue-600 rounded text-lg">Enviar</button>
                    </form>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </Modal>
                <div className="-my-8 divide-y-2 divide-gray-100">
                    {Array.isArray(data) && data.map((item, index) => (
                        <div key={index} className="py-8 flex flex-wrap md:flex-nowrap">
                            <div className="md:w-64 md:mb-0 mb-6 flex-shrink-0 flex flex-col">
                                <span className="font-semibold title-font text-gray-700">Fecha</span>
                                <span className="mt-1 text-gray-500 text-sm">{new Date(item.fecha).toLocaleDateString() + ' ' + new Date(item.fecha).toLocaleTimeString()}</span>
                            </div>
                            <div className="md:flex-grow">
                                <h2 className="text-2xl font-medium text-gray-900 title-font mb-2"></h2>
                                <p className="leading-relaxed">{item.cedula}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

