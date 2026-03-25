import { Acceptance } from "../acceptance.schema";
import { mockCustomers } from "@/features/customers/mocks/customers.mock";
import { mockBrands } from "@/features/brands/mocks/brands.mock";
import { mockModels } from "@/features/models/mocks/models.mock";
import { mockUsers } from "@/features/users/mocks/users.mock";
import { mockMasterSettings } from "@/features/master-settings/mocks/master-setting.mock";
import { REPAIR_STATUSES, KANBAN_COLUMNS } from "../acceptance.constants";
import { 
  createOperationalLog, 
  createTimelineLog, 
  getIconForAction, 
  getColorForStatus,
  OperationalLog,
  TimelineLog
} from "../acceptance-logging";

const getMasterValues = (key: string) => {
    const setting = mockMasterSettings.find(s => s.key === key);
    return setting ? setting.values.map(v => v.value) : [];
};

const deviceTypes = getMasterValues("DEVICE_TYPE");
const statuses = KANBAN_COLUMNS; // Use standardized statuses
const warranties = getMasterValues("WARRANTY");
const colors = getMasterValues("COLOR");
const accessories = getMasterValues("ACCESSORY");

const booleans = [true, false];
const defects = [
    "Screen is cracked and touch not responding in lower half.",
    "Battery draining very fast, needs replacement.",
    "Phone not turning on, possible motherboard issue.",
    "Water damage, device is not responsive.",
    "Charging port is loose and not charging properly.",
    "Camera is blurry and out of focus.",
    "Speaker volume is very low.",
];

const getRandom = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateAcceptances = (count: number): Acceptance[] => {
    return Array.from({ length: count }).map((_, i) => {
        const customer = getRandom(mockCustomers);
        const brand = getRandom(mockBrands);
        const model = getRandom(mockModels.filter(m => m.brand_id === brand.id)) || getRandom(mockModels);
        const technician = getRandom(mockUsers);
        const urgent = getRandom(booleans);
        const pinUnlock = getRandom(booleans);
        // Date generated here
        const dateObj = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        
        const estimatedPrice = Math.floor(Math.random() * 451) + 50;
        const advancePayment = Math.random() > 0.5 ? Math.floor(estimatedPrice / 3) : 0;
        const totalCost = estimatedPrice;
        const balanceDue = totalCost - advancePayment;

        // Assign random status
        const currentStatus = getRandom(statuses);

        // Generate logs based on current status (realistic timeline)
        const logs: Array<{ operational: OperationalLog; timeline?: TimelineLog }> = [];
        
        // Calculate realistic timestamps for each log
        // Base time is ticket creation
        const baseTime = dateObj.getTime();
        
        // All tickets start with TICKET_CREATED
        const createdOp = createOperationalLog(
            "TICKET_CREATED",
            "Device acceptance ticket created",
            technician.id,
            {},
            new Date(baseTime)
        );
        const createdTl = createTimelineLog(
            "TICKET_CREATED",
            "Device intake initiated",
            getIconForAction("TICKET_CREATED"),
            getColorForStatus(REPAIR_STATUSES.PENDING),
            technician.id,
            new Date(baseTime)
        );
        logs.push({ operational: createdOp, timeline: createdTl });

        // Enhance logs based on status progression
        if (currentStatus !== REPAIR_STATUSES.PENDING) {
            // Technician assigned 4-8 hours after creation
            const assignedTime = baseTime + (Math.floor(Math.random() * 4) + 4) * 60 * 60 * 1000;
            
            const assignedOp = createOperationalLog(
                "TECHNICIAN_ASSIGNED",
                `Ticket assigned to ${technician.name}`,
                technician.id,
                { technicianId: technician.id, technicianName: technician.name },
                new Date(assignedTime)
            );
            const assignedTl = createTimelineLog(
                "TECHNICIAN_ASSIGNED",
                `Assigned to ${technician.name}`,
                getIconForAction("TECHNICIAN_ASSIGNED"),
                getColorForStatus(REPAIR_STATUSES.DIAGNOSING),
                technician.id,
                new Date(assignedTime)
            );
            logs.push({ operational: assignedOp, timeline: assignedTl });
        }

        if (currentStatus === REPAIR_STATUSES.IN_PROGRESS || currentStatus === REPAIR_STATUSES.READY || currentStatus === REPAIR_STATUSES.DELIVERED) {
            // Status changed to IN_PROGRESS - 1-3 days after creation
            const inProgressTime = baseTime + (Math.floor(Math.random() * 2) + 1) * 24 * 60 * 60 * 1000;
            
            const statusOp = createOperationalLog(
                "STATUS_CHANGED",
                `Status changed to ${REPAIR_STATUSES.IN_PROGRESS}`,
                technician.id,
                { fromStatus: REPAIR_STATUSES.DIAGNOSING, toStatus: REPAIR_STATUSES.IN_PROGRESS },
                new Date(inProgressTime)
            );
            const statusTl = createTimelineLog(
                "STATUS_CHANGED",
                `Status changed to In Progress`,
                getIconForAction("STATUS_CHANGED"),
                getColorForStatus(REPAIR_STATUSES.IN_PROGRESS),
                technician.id,
                new Date(inProgressTime)
            );
            logs.push({ operational: statusOp, timeline: statusTl });
        }

        if (currentStatus === REPAIR_STATUSES.READY || currentStatus === REPAIR_STATUSES.DELIVERED) {
            // Status changed to READY - 3-6 days after creation
            const readyTime = baseTime + (Math.floor(Math.random() * 3) + 3) * 24 * 60 * 60 * 1000;
            
            const readyOp = createOperationalLog(
                "STATUS_CHANGED",
                `Device repair completed and marked as Ready for delivery`,
                technician.id,
                { fromStatus: REPAIR_STATUSES.IN_PROGRESS, toStatus: REPAIR_STATUSES.READY },
                new Date(readyTime)
            );
            const readyTl = createTimelineLog(
                "STATUS_CHANGED",
                `Status changed to Ready`,
                getIconForAction("STATUS_CHANGED"),
                getColorForStatus(REPAIR_STATUSES.READY),
                technician.id,
                new Date(readyTime)
            );
            logs.push({ operational: readyOp, timeline: readyTl });
        }

        if (currentStatus === REPAIR_STATUSES.DELIVERED) {
            // Payment received - 3-7 days after creation
            if (advancePayment > 0) {
                const paymentTime = baseTime + (Math.floor(Math.random() * 4) + 3) * 24 * 60 * 60 * 1000;
                
                const paymentOp = createOperationalLog(
                    "PAYMENT_RECEIVED",
                    `Payment settled. Amount collected: ${totalCost}`,
                    technician.id,
                    { amountCollected: totalCost, paymentMethod: "cash" },
                    new Date(paymentTime)
                );
                logs.push({ operational: paymentOp });
            }

            // Delivery completed - 3-7 days after creation
            const deliveryTime = baseTime + (Math.floor(Math.random() * 4) + 3) * 24 * 60 * 60 * 1000;
            
            const deliveredOp = createOperationalLog(
                "DELIVERY_COMPLETED",
                "Payment settled and device handed over to customer",
                technician.id,
                { amountCollected: totalCost },
                new Date(deliveryTime)
            );
            const deliveredTl = createTimelineLog(
                "DELIVERY_COMPLETED",
                "Device delivered to customer",
                getIconForAction("DELIVERY_COMPLETED"),
                getColorForStatus(REPAIR_STATUSES.DELIVERED),
                technician.id,
                new Date(deliveryTime)
            );
            logs.push({ operational: deliveredOp, timeline: deliveredTl });
        } else if (currentStatus === REPAIR_STATUSES.WAITING_PARTS) {
            // Show pause state - 1-3 days after creation
            const pauseTime = baseTime + (Math.floor(Math.random() * 2) + 1) * 24 * 60 * 60 * 1000;
            
            const pauseOp = createOperationalLog(
                "STATUS_CHANGED",
                "Repair on hold. Waiting for required parts",
                technician.id,
                { fromStatus: REPAIR_STATUSES.IN_PROGRESS, toStatus: REPAIR_STATUSES.WAITING_PARTS },
                new Date(pauseTime)
            );
            const pauseTl = createTimelineLog(
                "STATUS_CHANGED",
                `Status changed to Waiting Parts`,
                getIconForAction("STATUS_CHANGED"),
                getColorForStatus(REPAIR_STATUSES.WAITING_PARTS),
                technician.id,
                new Date(pauseTime)
            );
            logs.push({ operational: pauseOp, timeline: pauseTl });
        } else if (currentStatus === REPAIR_STATUSES.ON_HOLD || currentStatus === REPAIR_STATUSES.UNREPAIRABLE) {
            // Handle other statuses - within 24 hours
            const statusTime = baseTime + Math.floor(Math.random() * 24) * 60 * 60 * 1000;
            
            const statusFriendlyName = currentStatus === REPAIR_STATUSES.ON_HOLD ? "On Hold" : "Unrepairable";
            const statusOp = createOperationalLog(
                "STATUS_CHANGED",
                `Device status changed to ${statusFriendlyName}`,
                technician.id,
                { fromStatus: REPAIR_STATUSES.DIAGNOSING, toStatus: currentStatus },
                new Date(statusTime)
            );
            const statusTl = createTimelineLog(
                "STATUS_CHANGED",
                `Status changed to ${statusFriendlyName}`,
                getIconForAction("STATUS_CHANGED"),
                getColorForStatus(currentStatus),
                technician.id,
                new Date(statusTime)
            );
            logs.push({ operational: statusOp, timeline: statusTl });
        }

        // Add some part logs for complexity
        if (i % 3 === 0 && (currentStatus === REPAIR_STATUSES.IN_PROGRESS || currentStatus === REPAIR_STATUSES.READY || currentStatus === REPAIR_STATUSES.DELIVERED)) {
            // Part added - 12-36 hours after creation (during repair)
            const partTime = baseTime + (Math.floor(Math.random() * 2) + 1) * 24 * 60 * 60 * 1000;
            
            const partOp = createOperationalLog(
                "PART_ADDED",
                "Screen Replacement Kit added to bill (₹49.99)",
                technician.id,
                { itemName: "Screen Replacement Kit", itemPrice: 49.99, newTotal: totalCost },
                new Date(partTime)
            );
            logs.push({ operational: partOp });
        }

        // Reverse logs to show newest first (top = newest)
        const reversedLogs = logs.reverse();

        // Extract timeline logs, filtering out undefined entries
        const timelineLogs = reversedLogs
            .map(l => l.timeline)
            .filter((log): log is TimelineLog => log !== undefined);

        return {
            id: `rec-${100 + i}`,
            acceptanceNumber: `${41604 + i}-2026`,
            customerId: customer.id,
            brandId: brand.id,
            modelId: model.id,
            technicianId: technician.id,
            acceptanceDate: dateObj, 
            estimatedPrice: estimatedPrice,
            advancePayment: advancePayment,
            totalCost: totalCost,
            balanceDue: currentStatus === REPAIR_STATUSES.DELIVERED ? 0 : balanceDue,
            color: getRandom(colors),
            accessories: getRandom(accessories),
            deviceType: getRandom(deviceTypes),
            currentStatus: currentStatus,
            defectDescription: getRandom(defects),
            notes: "Customer seems to be in a hurry. Please prioritize.",
            imei: String(Math.floor(1e14 + Math.random() * 9e14)),
            secondaryImei: Math.random() > 0.8 ? String(Math.floor(1e14 + Math.random() * 9e14)) : "",
            loanerDeviceId: Math.random() > 0.9 ? "item-104" : "",
            warranty: getRandom(warranties),
            importantInformation: getRandom(booleans),
            pinUnlock: pinUnlock,
            pinUnlockNumber: pinUnlock ? Math.floor(1000 + Math.random() * 9000).toString() : "",
            urgent: urgent,
            urgentDateTime: urgent ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
            quote: getRandom(booleans),
            photos: i % 3 === 0 ? ["/mock/iphone-front.jpg", "/mock/iphone-back.jpg"] : [],
            partsUsed: i % 4 === 0 ? [{ itemId: "item-102", name: "Screen Replacement Kit", quantity: 1, price: 49.99 }] : [],
            operationalLogs: reversedLogs.map(l => l.operational),
            timelineLogs: timelineLogs,
            createdAt: dateObj.toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            priceOffered: Math.random() > 0.9 ? Math.floor(Math.random() * 200) : 0,
            dealer: "",
            replacementDeviceId: "",
            reservedNotes: ""
        };
    });
};

export const mockAcceptances: Acceptance[] = generateAcceptances(45);