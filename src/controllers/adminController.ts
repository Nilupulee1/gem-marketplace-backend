import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Gem from '../models/Gem';
import User from '../models/User';
import { GemStatus } from '../types';

export const getPendingGems = async (req: AuthRequest, res: Response) => {
  try {
    const gems = await Gem.find({ status: GemStatus.PENDING })
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    res.json({ gems });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const reviewGem = async (req: AuthRequest, res: Response) => {
  try {
    const { gemId, status, feedback } = req.body;

    if (![GemStatus.APPROVED, GemStatus.REJECTED].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const gem = await Gem.findById(gemId);
    if (!gem) {
      return res.status(404).json({ message: 'Gem not found' });
    }

    gem.status = status;
    if (feedback) {
      gem.adminFeedback = feedback;
    }

    await gem.save();

    res.json({
      message: `Gem ${status} successfully`,
      gem
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalGems = await Gem.countDocuments();
    const pendingGems = await Gem.countDocuments({ status: GemStatus.PENDING });
    const approvedGems = await Gem.countDocuments({ status: GemStatus.APPROVED });

    res.json({
      statistics: {
        totalUsers,
        totalGems,
        pendingGems,
        approvedGems
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};