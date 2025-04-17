'use client'

import * as React from "react"
import Image from "next/image"
import Autoplay from "embla-carousel-autoplay"
import { FaXTwitter } from "react-icons/fa6"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import Link from "next/link"

interface HonoraryMember {
    image: string;
    name: string;
    title?: string;
    twitter: string;
}

const CarouselHome: React.FC = () => {
    const plugin = React.useRef(
        Autoplay({ delay: 2000, stopOnInteraction: false })
    )

    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkMobile()
        window.addEventListener("resize", checkMobile)

        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    const partners: HonoraryMember[] = [
        {
            image: "/images/Honorary/Honorary_1_Rida.png",
            name: "Rida",
            title: "Builder",
            twitter: "https://x.com/RidazLp2"
        },
        {
            image: "/images/Honorary/Honorary_2_Allo.png",
            name: "Allo",
            title: "Builder",
            twitter: "https://x.com/dev_allo"
        },
        {
            image: "/images/Honorary/Honorary_3_Grateful.png",
            name: "GratefulApe",
            title: "Builder",
            twitter: "https://x.com/GratefulApe_eth"
        },
        {
            image: "/images/Honorary/Honorary_4_Frostyz.png",
            name: "Frostyz",
            title: "Builder",
            twitter: "https://x.com/CryptoFrostyz"
        },
        {
            image: "/images/Honorary/Honorary_5_Guccheetah.png",
            name: "Guccheetah",
            title: "Builder",
            twitter: "https://x.com/guccheetah"
        },
        {
            image: "/images/Honorary/Honorary_6_Nash.png",
            name: "Nash",
            title: "Builder",
            twitter: "https://x.com/nashahmed3"
        },
        {
            image: "/images/Honorary/Honorary_7_Dim.png",
            name: "Dim",
            title: "Builder",
            twitter: "https://x.com/dim8765"
        },
        {
            image: "/images/Honorary/Honorary_8_Banana_Boyz.png",
            name: "Banana Boyz",
            title: "Builder",
            twitter: "https://x.com/TheBananaBoyz_"
        },
        {
            image: "/images/Honorary/Honorary_9_ApeWater.png",
            name: "Ape Water",
            title: "Builder",
            twitter: "https://x.com/ApeBeverages"
        },
        {
            image: "/images/Honorary/Honorary_10_Gazette.png",
            name: "The Bored Ape Gazette",
            title: "Builder",
            twitter: "https://x.com/BoredApeGazette"
        },
        {
            image: "/images/Honorary/Honorary_11_Mo.png",
            name: "Mo Elzedin",
            title: "Builder",
            twitter: "https://x.com/Mo_Ezz14"
        },
        {
            image: "/images/Honorary/Honorary_12_James.png",
            name: "James",
            title: "Builder",
            twitter: "https://x.com/James_LympoDAO"
        },
        {
            image: "/images/Honorary/Honorary_13_Zul.png",
            name: "Zul",
            title: "Builder",
            twitter: "https://x.com/abutuqo80"
        },
        {
            image: "/images/Honorary/Honorary_14_Squiddy.png",
            name: "Squiddy",
            title: "Builder",
            twitter: "https://x.com/SquiddyNFT"
        },
    ]

    return (
        <section id="partner-carousel" className={`py-${isMobile ? '10' : '32'} px-4 ${isMobile ? 'mt-40' : 'mt-4'} bg-transparent flex flex-col items-center`}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#ffffff] text-center">Honorary Members</h2>
            <div className="container mx-auto py-20">
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                        slidesToScroll: isMobile ? 1 : 1
                    }}
                    plugins={[plugin.current]}
                    className="w-full"
                >
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {partners.map((partner, index) => (
                            <CarouselItem
                                key={index}
                                className="pl-2 md:pl-4 basis-1/3 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                            >
                                <div className="p-1">
                                    <Card className="bg-[#004BE0] border-none">
                                        <CardContent className="flex flex-col gap-4 p-4 md:p-8 lg:p-10">
                                            <div className="aspect-square md:aspect-[4/3] flex items-center justify-center">
                                                <Image
                                                    src={partner.image}
                                                    alt={`${partner.name} - Honorary Member`}
                                                    width={400}
                                                    height={300}
                                                    style={{ objectFit: "contain" }}
                                                    className="w-full h-full rounded-[8px] "
                                                />
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-[#F5C000] font-bold text-xl mb-1">
                                                    {partner.name}
                                                </h3>
                                                {partner.title && (
                                                    <p className="text-white/80 text-sm mb-2">
                                                        {partner.title}
                                                    </p>
                                                )}
                                                <a
                                                    href={partner.twitter}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-white hover:text-[#F5C000] transition-colors duration-300"
                                                >
                                                    <FaXTwitter className="w-4 h-4" />
                                                    <span className="text-sm"></span>
                                                </a>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {isMobile ? null : (
                        <>
                            <CarouselPrevious />
                            <CarouselNext />
                        </>
                    )}
                </Carousel>
            </div>

            <div className="flex justify-center mt-8">
                <Link
                    target="_blank"
                    href="https://magiceden.io/collections/apechain/0x5D61e92c03A65a6F0BB16Eb6592649e9CB20cCc3"
                    className="bg-[#F5C000] text-white px-4 py-2 rounded-[8px] hover:opacity-60 transition-opacity duration-500 font-bold mb-20"
                >
                    Discover the Honorary Collection
                </Link>
            </div>
        </section>
    )
}

export default CarouselHome;