import {StickyNavbar} from "../components/StickyNavbar";
import {
    Card,
    CardBody,
    CardHeader,
    Typography
} from "@material-tailwind/react";
import {EnvelopeIcon, PencilSquareIcon} from "@heroicons/react/16/solid";

function Account() {
    return (
        <div>
            <StickyNavbar/>
            <Card className="w-full">
                <CardHeader
                    floated={false}
                    className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 p-6"
                >
                    <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 flex-1 text-center sm:text-left">
                        <img
                            src="/assets/avatar.png"
                            alt="profile-picture"
                            className="w-32 h-32 object-cover rounded-full border-2"
                        />
                        <div className="flex flex-col items-center sm:items-start">
                            <Typography variant="h4" color="blue-gray" className="mb-2">
                                John Doe
                            </Typography>
                            <Typography
                                color="blue-gray"
                                className="flex items-center gap-2 font-medium"
                                textGradient
                            >
                                <EnvelopeIcon className="w-6 h-6 text-purple-200" />
                                example@gmail.com
                            </Typography>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex-shrink-0">
                        <PencilSquareIcon className="w-10 h-10 text-blue-gray-900" />
                    </div>
                </CardHeader>
                <CardBody className="text-center">
                </CardBody>
            </Card>
        </div>
    );
}

export default Account;